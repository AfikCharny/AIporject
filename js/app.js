/*
 * app.js — scene, model assembly, interaction and UI wiring.
 */
(function (global) {
  'use strict';
  var THREE = global.THREE, HB = global.HB;
  var G = HB.G;

  /* ------------------------------------------------------------- config */
  var GROUPS = ['Head & Neck', 'Chest', 'Abdomen', 'Back', 'Shoulder', 'Arm',
                'Forearm', 'Hip', 'Thigh', 'Leg'];
  var GROUP_COLOR = {
    'Head & Neck': 0xba4553, 'Chest': 0xbc3c4b, 'Abdomen': 0xc24d55,
    'Back': 0xa8323f, 'Shoulder': 0xc44450, 'Arm': 0xb53b48,
    'Forearm': 0xbe4550, 'Hip': 0xa93744, 'Thigh': 0xb63c49, 'Leg': 0xae3946
  };
  var TENDON = 0xe6dbc3;
  var DETACH_DIST = 0.24;
  var SPREAD_DIST = 0.55;

  /* -------------------------------------------------------------- state */
  var state = {
    mode: 'body',        // body -> muscles -> bones
    gymOnly: true,       // show only the muscles a lifter trains
    ghost: true,         // keep a translucent skin while dissecting
    selected: null,
    hovered: null,
    hidden: {},
    detached: {},
    explode: 0,
    layerMax: 3,
    side: 'both',
    opacity: 1,
    skeleton: true,
    labels: false,
    isolate: false,
    mirror: true,
    autoRotate: false
  };

  var scene, camera, renderer, controls, raycaster, pointer;
  var muscleMeshes = [], byKey = {}, byId = {}, skeletonMesh, skinMesh, skinMat, skinOpacity = 1;
  var leaderGeo, leaderLine;
  var labelLayer, tooltipEl;
  var clock;

  /* ---------------------------------------------------------------- init */
  function init() {
    var canvas = document.getElementById('view');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1116);
    scene.fog = new THREE.Fog(0x0e1116, 5.5, 11);

    camera = new THREE.PerspectiveCamera(38, 1, 0.05, 40);
    controls = new HB.Orbit(camera, canvas);
    controls.setView(0, Math.PI / 2 - 0.04, new THREE.Vector3(0, 0.90, 0), 3.80);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    clock = new THREE.Clock();

    lights();
    ground();

    labelLayer = document.getElementById('labels');
    tooltipEl = document.getElementById('tooltip');

    leaderGeo = new THREE.BufferGeometry();
    leaderGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 400), 3));
    leaderLine = new THREE.LineSegments(leaderGeo, new THREE.LineBasicMaterial({
      color: 0x6ea8c8, transparent: true, opacity: 0.5
    }));
    leaderLine.frustumCulled = false;
    scene.add(leaderLine);

    skeletonMesh = HB.buildSkeleton(HB.buildRetarget());
    scene.add(skeletonMesh);

    window.addEventListener('resize', resize);
    resize();
    bindPointer(canvas);
    buildMuscles(function () {
      document.getElementById('note').textContent = 'Loading the body mesh…';
      HB.loadBody('assets/body.bin', function (group) {
        skinMesh = group;
        scene.add(skinMesh);
        skinMesh.traverse(function (n) { if (n.material) skinMat = n.material; });
        buildUI();
        document.getElementById('loading').classList.add('gone');
      }, function (err) {
        // without the body mesh the anatomy still works; say what happened
        var note = document.getElementById('note');
        note.innerHTML = 'Could not load assets/body.bin (' + err.message +
          ').<br>Serve the folder over http rather than opening the file directly.';
        note.classList.add('err');
        state.mode = 'muscles';
        buildUI();
        setTimeout(function () {
          document.getElementById('loading').classList.add('gone');
        }, 3200);
      });
    });
    animate();
  }

  function lights() {
    scene.add(new THREE.HemisphereLight(0xbcd5ff, 0x241a1c, 0.55));
    var key = new THREE.DirectionalLight(0xfff2e6, 1.05);
    key.position.set(2.4, 3.2, 3.0);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0x9fc4ff, 0.55);
    fill.position.set(-3.0, 1.2, 1.6);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xffd9c4, 0.75);
    rim.position.set(-1.2, 2.0, -3.4);
    scene.add(rim);
    var under = new THREE.DirectionalLight(0x6d8bb5, 0.25);
    under.position.set(0, -2, 1);
    scene.add(under);
  }

  function ground() {
    var geo = new THREE.CircleGeometry(2.2, 64);
    geo.rotateX(-Math.PI / 2);
    var mat = new THREE.MeshBasicMaterial({ color: 0x151a21, transparent: true, opacity: 0.85 });
    var disc = new THREE.Mesh(geo, mat);
    disc.position.y = -0.002;
    scene.add(disc);
    var grid = new THREE.GridHelper(4.4, 22, 0x2a3442, 0x1b2129);
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    scene.add(grid);
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  /* ------------------------------------------------------- build muscles */
  function shade(hex, k) {
    var c = new THREE.Color(hex);
    var hsl = {};
    c.getHSL(hsl);
    c.setHSL((hsl.h + k * 0.010 + 1) % 1,
             THREE.MathUtils.clamp(hsl.s + k * 0.03, 0, 1),
             THREE.MathUtils.clamp(hsl.l + k * 0.022, 0.12, 0.72));
    return c.getHex();
  }

  function makeMesh(def, geo, side) {
    var centre = G.centroid(geo);
    geo.translate(-centre.x, -centre.y, -centre.z);
    var mat = new THREE.MeshStandardMaterial({
      vertexColors: true, color: 0xffffff, roughness: 0.68, metalness: 0.0,
      emissive: 0x000000
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(centre);
    geo.computeBoundingSphere();
    var axis = new THREE.Vector3(centre.x, 0, centre.z + 0.02);
    if (axis.lengthSq() < 1e-5) axis.set(0, 0, 1);
    mesh.userData = {
      def: def, side: side, key: def.id + '.' + side,
      home: centre.clone(),
      dir: axis.normalize(),
      radius: geo.boundingSphere.radius,
      t: 0
    };
    mesh.name = def.name;
    return mesh;
  }

  function buildMuscles(done) {
    HB.applyGym();
    var defs = HB.MUSCLES, i = 0;
    var fit = HB.buildRetarget();
    var bar = document.getElementById('bar');
    function step() {
      var t0 = performance.now();
      while (i < defs.length && performance.now() - t0 < 24) {
        var def = defs[i];
        var ctx = {
          G: G, p: HB.p, mix: HB.mix, L: HB.L,
          color: def.tendonous ? 0xdbd0b8 : shade(GROUP_COLOR[def.group] || 0xb2394a, (i % 5) - 2),
          tendon: TENDON
        };
        var geo = fit.geometry(def.build(ctx), HB.bonesFor(def));
        if (def.side === 'mid') {
          add(makeMesh(def, geo, 'M'));
        } else {
          // mirror first: makeMesh re-centres (and so mutates) the geometry
          var left = G.mirrorX(geo);
          add(makeMesh(def, geo, 'R'));
          add(makeMesh(def, left, 'L'));
        }
        if (def.defaultHidden) {
          state.hidden[def.id + '.R'] = true;
          state.hidden[def.id + '.L'] = true;
          state.hidden[def.id + '.M'] = true;
        }
        i++;
        bar.style.width = Math.round((i / defs.length) * 100) + '%';
      }
      if (i < defs.length) requestAnimationFrame(step);
      else done();
    }
    function add(mesh) {
      scene.add(mesh);
      muscleMeshes.push(mesh);
      byKey[mesh.userData.key] = mesh;
      (byId[mesh.userData.def.id] = byId[mesh.userData.def.id] || []).push(mesh);
    }
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------- visual update */
  function visibleFor(mesh) {
    var u = mesh.userData, d = u.def;
    if (state.mode !== 'muscles') return false;
    if (state.gymOnly && !d.gym) return false;
    if (state.hidden[u.key]) return false;
    if (d.layer > state.layerMax) return false;
    if (state.side !== 'both' && u.side !== 'M' && u.side !== state.side) return false;
    if (state.isolate && state.selected) {
      var sel = byKey[state.selected];
      if (sel && sel.userData.def.id !== d.id) return false;
    }
    return true;
  }

  var tmpV = new THREE.Vector3();
  function updateMeshes(dt) {
    var lp = leaderGeo.attributes.position.array, ln = 0;
    var k = 1 - Math.pow(0.0001, dt);
    for (var i = 0; i < muscleMeshes.length; i++) {
      var m = muscleMeshes[i], u = m.userData;
      var vis = visibleFor(m);
      m.visible = vis;
      if (!vis) continue;

      var det = !!state.detached[u.key];
      var goal = det ? 1 : 0;
      u.t += (goal - u.t) * k;
      if (Math.abs(u.t - goal) < 0.001) u.t = goal;

      var dist = u.t * (DETACH_DIST + u.radius * 0.5) + state.explode * SPREAD_DIST;
      tmpV.copy(u.dir).multiplyScalar(dist);
      m.position.copy(u.home).add(tmpV);
      m.position.y += u.t * 0.02;

      var isSel = state.selected === u.key;
      var isSelId = state.selected && byKey[state.selected] &&
                    byKey[state.selected].userData.def.id === u.def.id;
      var isHover = state.hovered === u.key;
      var em = m.material.emissive;
      var target = isSel ? 0x542228 : (isHover ? 0x321619 : 0x000000);
      em.lerp(new THREE.Color(target).convertSRGBToLinear(), 0.25);
      m.material.emissiveIntensity = 1;

      var dim = (state.selected && !isSelId) ? 0.72 : 1;
      var op = state.opacity * dim;
      if (op < 0.999) {
        m.material.transparent = true;
        m.material.opacity += (op - m.material.opacity) * 0.25;
        m.material.depthWrite = op > 0.85;
      } else if (m.material.transparent) {
        m.material.opacity += (1 - m.material.opacity) * 0.25;
        if (m.material.opacity > 0.995) {
          m.material.transparent = false;
          m.material.opacity = 1;
          m.material.depthWrite = true;
        }
      }

      if (u.t > 0.02 && ln < 380) {
        lp[ln * 6] = u.home.x; lp[ln * 6 + 1] = u.home.y; lp[ln * 6 + 2] = u.home.z;
        lp[ln * 6 + 3] = m.position.x; lp[ln * 6 + 4] = m.position.y; lp[ln * 6 + 5] = m.position.z;
        ln++;
      }
    }
    leaderGeo.setDrawRange(0, ln * 2);
    leaderGeo.attributes.position.needsUpdate = true;
    skeletonMesh.visible = state.mode === 'bones' ||
      (state.mode === 'muscles' && state.skeleton);
    updateSkin(dt);
  }

  /* The skin fades rather than blinks, so it reads as peeling the body open. */
  function updateSkin(dt) {
    if (!skinMesh || !skinMat) return;
    var solid = state.mode === 'body';
    var target = solid ? 1 : (state.ghost ? 0.30 : 0);
    var k = 1 - Math.pow(0.002, dt);
    skinOpacity += (target - skinOpacity) * k;
    if (Math.abs(skinOpacity - target) < 0.005) skinOpacity = target;
    skinMesh.visible = skinOpacity > 0.012;
    skinMat.opacity = skinOpacity;
    skinMat.transparent = skinOpacity < 0.999;
    skinMat.depthWrite = skinOpacity > 0.92;
    // while dissecting, render only the inside of the far wall: the body keeps
    // its silhouette without a veil over the muscles in front of it
    var side = solid ? THREE.FrontSide : THREE.BackSide;
    if (skinMat.side !== side) { skinMat.side = side; skinMat.needsUpdate = true; }
  }

  /* --------------------------------------------------------------- labels */
  var labelPool = [];
  var MAX_LABELS = 26;
  function updateLabels() {
    var want = [];
    var showAll = state.labels;
    var detCount = Object.keys(state.detached).length;
    for (var i = 0; i < muscleMeshes.length; i++) {
      var m = muscleMeshes[i], u = m.userData;
      if (!m.visible) continue;
      var isSel = state.selected === u.key;
      // when everything is off the body, labelling all of it is unreadable
      var show = isSel || showAll || (state.detached[u.key] && detCount <= 18);
      if (!show) continue;
      tmpV.copy(m.position).project(camera);
      if (tmpV.z > 1 || Math.abs(tmpV.x) > 1.2 || Math.abs(tmpV.y) > 1.2) continue;
      want.push({
        mesh: m, sel: isSel, det: !!state.detached[u.key],
        x: (tmpV.x * 0.5 + 0.5) * window.innerWidth,
        y: (-tmpV.y * 0.5 + 0.5) * window.innerHeight,
        depth: tmpV.z
      });
    }
    // nearest first, then cap so a crowded view stays readable
    want.sort(function (a, b) { return (b.sel - a.sel) || (a.depth - b.depth); });
    if (want.length > MAX_LABELS) want.length = MAX_LABELS;

    // push overlapping labels apart vertically, keeping each on its own side
    want.sort(function (a, b) { return a.y - b.y; });
    var lastL = -1e3, lastR = -1e3;
    for (var k = 0; k < want.length; k++) {
      var w = want[k];
      var left = w.x < window.innerWidth / 2;
      var last = left ? lastL : lastR;
      if (w.y - last < 21) w.y = last + 21;
      if (left) lastL = w.y; else lastR = w.y;
      w.x += left ? -54 : 54;
    }

    for (var n = 0; n < want.length; n++) {
      var it = want[n], el = labelPool[n];
      if (!el) {
        el = document.createElement('div');
        el.className = 'lbl';
        labelLayer.appendChild(el);
        labelPool[n] = el;
      }
      var ud = it.mesh.userData;
      el.textContent = ud.def.name + (ud.side === 'M' ? '' : (ud.side === 'R' ? ' (R)' : ' (L)'));
      el.style.transform = 'translate(-50%,-50%) translate(' +
        it.x.toFixed(1) + 'px,' + it.y.toFixed(1) + 'px)';
      el.className = 'lbl' + (it.sel ? ' sel' : '') + (it.det ? ' det' : '');
      el.hidden = false;
    }
    for (var j = want.length; j < labelPool.length; j++) labelPool[j].hidden = true;
  }

  /* ------------------------------------------------------------ pointers */
  function bindPointer(canvas) {
    var moveTimer = 0;
    canvas.addEventListener('pointermove', function (e) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (performance.now() - moveTimer < 40) return;
      moveTimer = performance.now();
      var hit = pick();
      var key = hit ? hit.userData.key : null;
      if (key !== state.hovered) {
        state.hovered = key;
        canvas.style.cursor = key ? 'pointer' : 'grab';
      }
      if (hit) {
        tooltipEl.hidden = false;
        tooltipEl.textContent = hit.userData.def.name;
        tooltipEl.style.transform = 'translate(' + (e.clientX + 14) + 'px,' + (e.clientY + 16) + 'px)';
      } else tooltipEl.hidden = true;
    });
    canvas.addEventListener('pointerleave', function () {
      state.hovered = null; tooltipEl.hidden = true;
    });
    canvas.addEventListener('pointerup', function (e) {
      if (controls.moved || e.button !== 0) return;
      var hit = pick();
      if (hit) select(hit.userData.key);
      else select(null);
    });
    canvas.addEventListener('dblclick', function () {
      var hit = pick();
      if (hit) { select(hit.userData.key); toggleDetach(hit.userData.key, true); focusOn(hit, 3.0); }
    });
    window.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      var sel = state.selected && byKey[state.selected];
      if (e.key === 'Escape') { select(null); state.isolate = false; syncUI(); }
      else if (e.key === 'd' || e.key === 'D') { if (sel) { toggleDetach(sel.userData.key); syncUI(); } }
      else if (e.key === 'h' || e.key === 'H') { if (sel) { hide(sel.userData.key); syncUI(); } }
      else if (e.key === 'i' || e.key === 'I') { state.isolate = !state.isolate; syncUI(); }
      else if (e.key === 'r' || e.key === 'R') { resetAll(); }
      else if (e.key === 'l' || e.key === 'L') { state.labels = !state.labels; syncUI(); }
      else if (e.key === '1') setMode('body');
      else if (e.key === '2') setMode('muscles');
      else if (e.key === '3') setMode('bones');
      else if (e.key === 'g' || e.key === 'G') { state.ghost = !state.ghost; syncUI(); }
      else if (e.key === 'a' || e.key === 'A') {
        state.gymOnly = !state.gymOnly; renderList(); syncUI();
      }
      else if (e.key === 'x' || e.key === 'X') {
        state.opacity = state.opacity > 0.9 ? 0.35 : 1; syncUI();
      }
    });
  }

  function pick() {
    if (state.mode !== 'muscles') return null;
    raycaster.setFromCamera(pointer, camera);
    var list = muscleMeshes.filter(function (m) { return m.visible; });
    var hits = raycaster.intersectObjects(list, false);
    return hits.length ? hits[0].object : null;
  }

  /* Frame a muscle, swinging round to the side of the body it actually sits on
     so a back muscle isn't left hidden behind the chest. */
  function focusOn(mesh, pad) {
    var d = mesh.userData.dir;
    var az = Math.atan2(d.x, d.z);
    controls.frame(mesh.position.clone(),
      Math.max(mesh.userData.radius * (pad || 2.2), 0.22), az, Math.PI / 2 - 0.06);
  }

  /* -------------------------------------------------------------- actions */
  function setMode(mode) {
    state.mode = mode;
    if (mode !== 'muscles') { state.selected = null; state.hovered = null; }
    syncUI();
  }

  function keysFor(key) {
    var m = byKey[key];
    if (!m) return [];
    if (!state.mirror || m.userData.side === 'M') return [key];
    return byId[m.userData.def.id].map(function (x) { return x.userData.key; });
  }

  function select(key) {
    state.selected = key;
    renderDetails();
    highlightRow();
  }

  function toggleDetach(key, force) {
    var ks = keysFor(key);
    var on = force != null ? force : !state.detached[key];
    ks.forEach(function (k) {
      if (on) state.detached[k] = true; else delete state.detached[k];
    });
    renderDetails();
    highlightRow();
  }

  function hide(key, force) {
    var ks = keysFor(key);
    var on = force != null ? force : !state.hidden[key];
    ks.forEach(function (k) {
      if (on) state.hidden[k] = true; else delete state.hidden[k];
    });
    renderDetails();
    highlightRow();
  }

  function detachAll(on) {
    muscleMeshes.forEach(function (m) {
      if (on) { if (visibleFor(m)) state.detached[m.userData.key] = true; }
      else delete state.detached[m.userData.key];
    });
    renderDetails(); highlightRow();
  }

  function resetAll() {
    state.detached = {};
    state.hidden = {};
    HB.MUSCLES.forEach(function (d) {
      if (d.defaultHidden) { state.hidden[d.id + '.R'] = true; state.hidden[d.id + '.L'] = true; }
    });
    state.explode = 0;
    state.layerMax = 3;
    state.opacity = 1;
    state.isolate = false;
    state.side = 'both';
    state.selected = null;
    controls.setView(0, Math.PI / 2 - 0.04, new THREE.Vector3(0, 0.90, 0), 3.80);
    syncUI();
    renderDetails();
  }

  /* ------------------------------------------------------------------ UI */
  var els = {};
  function buildUI() {
    els.list = document.getElementById('list');
    els.details = document.getElementById('details');
    els.search = document.getElementById('search');
    els.count = document.getElementById('count');

    renderList();

    els.search.addEventListener('input', function () {
      var q = els.search.value.trim().toLowerCase();
      var shown = 0;
      document.querySelectorAll('.grp').forEach(function (sec) {
        var any = false;
        sec.querySelectorAll('.row').forEach(function (row) {
          var d = HB.MUSCLES.find(function (x) { return x.id === row.dataset.id; });
          var hay = d.name + ' ' + d.latin + ' ' + d.group + ' ' + d.action +
                    (d.gym ? ' ' + d.gym.group + ' ' + d.gym.trains : '');
          var hit = !q || hay.toLowerCase().indexOf(q) >= 0;
          row.hidden = !hit;
          if (hit) { any = true; shown++; }
        });
        sec.hidden = !any;
      });
      if (q) els.count.textContent = shown + ' matching'; else updateCount();
    });

    wire();
    syncUI();
    renderDetails();
  }

  /* The list is grouped the way the current filter thinks about the body:
     by training group under the gym filter, by anatomical region otherwise. */
  function renderList() {
    if (!els.list) return;
    els.list.innerHTML = '';
    var frag = document.createDocumentFragment();
    var groups = state.gymOnly ? HB.GYM_GROUPS : GROUPS;
    groups.forEach(function (gname) {
      var defs = HB.MUSCLES.filter(function (d) {
        return state.gymOnly ? (d.gym && d.gym.group === gname) : d.group === gname;
      });
      if (!defs.length) return;
      var sec = document.createElement('section');
      sec.className = 'grp';
      sec.dataset.group = gname;
      var head = document.createElement('div');
      head.className = 'grp-h';
      head.innerHTML = '<span class="dot" style="background:#' +
        new THREE.Color(GROUP_COLOR[defs[0].group] || 0xb2394a).getHexString() + '"></span><span>' +
        gname + '</span><span class="n">' + defs.length + '</span>';
      head.addEventListener('click', function () { sec.classList.toggle('closed'); });
      sec.appendChild(head);
      defs.forEach(function (d) {
        var row = document.createElement('div');
        row.className = 'row';
        row.dataset.id = d.id;
        row.innerHTML =
          '<button class="nm" title="' + d.latin + '">' + d.name +
          '<em>L' + d.layer + '</em></button>' +
          '<button class="ic det" title="Disassemble this muscle (D)">' + icon('detach') + '</button>' +
          '<button class="ic eye" title="Hide / show (H)">' + icon('eye') + '</button>';
        row.querySelector('.nm').addEventListener('click', function () {
          if (state.mode !== 'muscles') setMode('muscles');
          var key = pickKey(d.id);
          select(key);
          var m = byKey[key];
          if (m) focusOn(m, 3.4);
        });
        row.querySelector('.det').addEventListener('click', function (e) {
          e.stopPropagation();
          if (state.mode !== 'muscles') setMode('muscles');
          var key = pickKey(d.id);
          select(key);
          toggleDetach(key);
          syncUI();
        });
        row.querySelector('.eye').addEventListener('click', function (e) {
          e.stopPropagation();
          hide(pickKey(d.id));
          syncUI();
        });
        sec.appendChild(row);
      });
      frag.appendChild(sec);
    });
    els.list.appendChild(frag);
    updateCount();
    if (els.search.value) els.search.dispatchEvent(new Event('input'));
    highlightRow();
  }

  function shownMuscles() {
    return HB.MUSCLES.filter(function (d) { return !state.gymOnly || d.gym; });
  }

  function updateCount() {
    if (!els.count) return;
    var n = shownMuscles().length;
    els.count.textContent = state.gymOnly
      ? n + ' gym muscles · ' + HB.MUSCLES.length + ' in the atlas'
      : n + ' muscles · ' + muscleMeshes.length + ' parts';
  }

  function pickKey(id) {
    var list = byId[id];
    var pref = state.side === 'L' ? 'L' : 'R';
    for (var i = 0; i < list.length; i++) {
      if (list[i].userData.side === pref || list[i].userData.side === 'M') return list[i].userData.key;
    }
    return list[0].userData.key;
  }

  function icon(kind) {
    if (kind === 'eye') return '<svg viewBox="0 0 20 20"><path d="M10 4c4 0 7 4 7 6s-3 6-7 6-7-4-7-6 3-6 7-6zm0 3a3 3 0 100 6 3 3 0 000-6z"/></svg>';
    return '<svg viewBox="0 0 20 20"><path d="M9 2h2v6H9zM9 12h2v6H9zM2 9h6v2H2zM12 9h6v2h-6z"/></svg>';
  }

  function wire() {
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.dataset.mode); });
    });
    on('chk-ghost', 'change', function (e) { state.ghost = e.target.checked; });
    on('btn-explode-all', 'click', function () {
      if (state.mode !== 'muscles') setMode('muscles');
      detachAll(true); state.explode = 0.45; syncUI();
    });
    on('btn-assemble', 'click', function () { detachAll(false); state.explode = 0; syncUI(); });
    on('btn-reset', 'click', resetAll);
    on('slider-explode', 'input', function (e) { state.explode = +e.target.value / 100; });
    on('slider-layer', 'input', function (e) { state.layerMax = +e.target.value; syncUI(); });
    on('slider-opacity', 'input', function (e) { state.opacity = +e.target.value / 100; });
    on('chk-skeleton', 'change', function (e) { state.skeleton = e.target.checked; });
    on('chk-labels', 'change', function (e) { state.labels = e.target.checked; });
    on('chk-isolate', 'change', function (e) { state.isolate = e.target.checked; });
    on('chk-mirror', 'change', function (e) { state.mirror = e.target.checked; });
    on('chk-rotate', 'change', function (e) { controls.autoRotate = e.target.checked; });
    document.querySelectorAll('[data-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.gymOnly = b.dataset.set === 'gym';
        if (state.selected) {
          var sel = byKey[state.selected];
          if (sel && state.gymOnly && !sel.userData.def.gym) select(null);
        }
        renderList();
        syncUI();
      });
    });
    document.querySelectorAll('[data-side]').forEach(function (b) {
      b.addEventListener('click', function () { state.side = b.dataset.side; syncUI(); });
    });
    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.view, t = new THREE.Vector3(0, 0.90, 0), d = 3.80;
        if (v === 'front') controls.setView(0, Math.PI / 2 - 0.04, t, d);
        if (v === 'back') controls.setView(Math.PI, Math.PI / 2 - 0.04, t, d);
        if (v === 'left') controls.setView(-Math.PI / 2, Math.PI / 2 - 0.04, t, d);
        if (v === 'right') controls.setView(Math.PI / 2, Math.PI / 2 - 0.04, t, d);
        if (v === 'upper') controls.setView(0, Math.PI / 2 - 0.10, new THREE.Vector3(0, 1.30, 0), 1.35);
        if (v === 'lower') controls.setView(0, Math.PI / 2 - 0.02, new THREE.Vector3(0, 0.62, 0), 1.55);
      });
    });
    document.querySelectorAll('[data-panel]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.getElementById(b.dataset.panel).classList.toggle('open');
      });
    });
  }

  function on(id, ev, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  }

  function syncUI() {
    set('slider-explode', state.explode * 100);
    set('slider-layer', state.layerMax);
    set('slider-opacity', state.opacity * 100);
    check('chk-skeleton', state.skeleton);
    check('chk-labels', state.labels);
    check('chk-isolate', state.isolate);
    check('chk-mirror', state.mirror);
    check('chk-ghost', state.ghost);
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.mode === state.mode);
    });
    document.body.classList.toggle('mode-body', state.mode === 'body');
    document.body.classList.toggle('mode-bones', state.mode === 'bones');
    document.querySelectorAll('[data-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.gymOnly = b.dataset.set === 'gym';
        if (state.selected) {
          var sel = byKey[state.selected];
          if (sel && state.gymOnly && !sel.userData.def.gym) select(null);
        }
        renderList();
        syncUI();
      });
    });
    document.querySelectorAll('[data-side]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.side === state.side);
    });
    document.querySelectorAll('[data-set]').forEach(function (b) {
      b.classList.toggle('on', (b.dataset.set === 'gym') === state.gymOnly);
    });
    updateCount();
    var lay = document.getElementById('layer-label');
    if (lay) lay.textContent = ['', 'superficial', 'through intermediate', 'all layers'][state.layerMax];
    highlightRow();
    renderDetails();
  }
  function set(id, v) { var e = document.getElementById(id); if (e) e.value = v; }
  function check(id, v) { var e = document.getElementById(id); if (e) e.checked = v; }

  function highlightRow() {
    var selId = state.selected && byKey[state.selected] ? byKey[state.selected].userData.def.id : null;
    document.querySelectorAll('.row').forEach(function (row) {
      var id = row.dataset.id;
      row.classList.toggle('sel', id === selId);
      var anyDet = (byId[id] || []).some(function (m) { return state.detached[m.userData.key]; });
      var allHid = (byId[id] || []).every(function (m) { return state.hidden[m.userData.key]; });
      row.classList.toggle('detached', anyDet);
      row.classList.toggle('hiddenm', allHid);
    });
    var n = Object.keys(state.detached).length;
    var badge = document.getElementById('det-count');
    if (badge) badge.textContent = n ? n + ' detached' : '';
  }

  function renderDetails() {
    if (!els.details) return;
    var m = state.selected && byKey[state.selected];
    if (!m && state.mode !== 'muscles') {
      els.details.innerHTML = state.mode === 'body'
        ? '<div class="empty"><h3>The whole body</h3>' +
          '<p>This is the figure with its skin on. Switch to <b>Muscles</b> to strip the ' +
          'skin away and work through 69 muscles, or <b>Skeleton</b> for bone alone.</p>' +
          '<p class="keys"><b>Drag</b> orbit · <b>Wheel</b> zoom · <b>Shift+drag</b> pan · ' +
          '<b>1</b> body · <b>2</b> muscles · <b>3</b> skeleton</p></div>'
        : '<div class="empty"><h3>Skeleton</h3>' +
          '<p>Every muscle in this atlas is built onto these landmarks. Switch back to ' +
          '<b>Muscles</b> to put them back on the bone.</p>' +
          '<p class="keys"><b>1</b> body · <b>2</b> muscles · <b>3</b> skeleton · ' +
          '<b>G</b> ghost skin</p></div>';
      return;
    }
    if (!m) {
      els.details.innerHTML = '<div class="empty"><h3>Nothing selected</h3>' +
        '<p>Click any muscle in the 3D view, or pick one from the list, to read its attachments and take it off the body.</p>' +
        '<p class="keys"><b>Drag</b> orbit · <b>Wheel</b> zoom · <b>Shift+drag</b> pan · ' +
        '<b>Double-click</b> detach and zoom · <b>D</b> disassemble · <b>H</b> hide · ' +
        '<b>I</b> isolate · <b>X</b> x-ray · <b>L</b> labels · <b>R</b> reset</p></div>';
      return;
    }
    var d = m.userData.def;
    var det = !!state.detached[m.userData.key];
    var hid = !!state.hidden[m.userData.key];
    els.details.innerHTML =
      '<div class="d-head"><h2>' + d.name + '</h2><p class="lat">' + d.latin + '</p>' +
      '<p class="tags"><span class="tag">' + d.group + '</span>' +
      '<span class="tag">Layer ' + d.layer + ' · ' + ['', 'superficial', 'intermediate', 'deep'][d.layer] + '</span>' +
      (d.gym ? '<span class="tag gym">' + d.gym.group + '</span>' : '') +
      '<span class="tag">' + (m.userData.side === 'M' ? 'midline' : (m.userData.side === 'R' ? 'right side' : 'left side')) + '</span></p></div>' +
      '<dl>' +
      '<dt>Origin</dt><dd>' + d.origin + '</dd>' +
      '<dt>Insertion</dt><dd>' + d.insertion + '</dd>' +
      '<dt>Action</dt><dd>' + d.action + '</dd>' +
      (d.gym ? '<dt>Trained by</dt><dd>' + d.gym.trains + '</dd>' : '') +
      '<dt>Innervation</dt><dd>' + (d.nerve || '—') + '</dd>' +
      '</dl>' +
      '<div class="d-btns">' +
      '<button id="d-detach" class="primary">' + (det ? 'Re-attach' : 'Disassemble') + '</button>' +
      '<button id="d-hide">' + (hid ? 'Show' : 'Hide') + '</button>' +
      '<button id="d-focus">Zoom to</button>' +
      '</div>';
    document.getElementById('d-detach').addEventListener('click', function () {
      toggleDetach(m.userData.key); syncUI();
    });
    document.getElementById('d-hide').addEventListener('click', function () {
      hide(m.userData.key); syncUI();
    });
    document.getElementById('d-focus').addEventListener('click', function () {
      focusOn(m, 3.2);
    });
  }

  /* ------------------------------------------------------------- animate */
  function animate() {
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta(), 0.05);
    controls.update(dt);
    updateMeshes(dt);
    updateLabels();
    renderer.render(scene, camera);
  }

  /* exposed for debugging and for anyone scripting the viewer from the console */
  HB.app = {
    state: state, byKey: byKey, byId: byId, meshes: muscleMeshes,
    select: select, detach: toggleDetach, hide: hide, detachAll: detachAll,
    reset: resetAll, sync: syncUI,
    rebuildSkin: function (opts) {
      if (skinMesh) scene.remove(skinMesh);
      skinMesh = HB.buildSkin(Object.assign(
        { meshes: muscleMeshes.concat([skeletonMesh]) }, opts || {}));
      scene.add(skinMesh);
      return skinMesh.userData;
    },
    view: function (az, polar, tx, ty, tz, dist) {
      controls.setView(az, polar, new THREE.Vector3(tx, ty, tz), dist);
    },
    get camera() { return camera; },
    get controls() { return controls; },
    get scene() { return scene; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
