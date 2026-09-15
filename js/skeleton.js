/*
 * skeleton.js — a simplified skeleton so that a disassembled body still has
 * something to hang the remaining muscles on. Built from the same landmark
 * table the muscles use, so attachments line up.
 */
(function (global) {
  'use strict';
  var HB = global.HB, THREE = global.THREE;
  var G = HB.G, L = HB.L, p = HB.p, mix = HB.mix;

  var BONE = 0xc4bba4;
  var BONE_DK = 0xafa68f;

  function shaft(a, b, r, o) {
    return G.belly([a, mix(a, b, 0.5), b], Object.assign({
      r: r, endA: 0.86, endB: 0.86, bulge: 0.5, seg: 14, rad: 12,
      color: BONE, tendon: BONE_DK, fascicles: 0
    }, o || {}));
  }

  function buildRight() {
    var g = [];

    /* ---- clavicle, scapula, humerus, forearm, hand ---- */
    g.push(shaft(p('clavMed'), p('acromion', -0.004, 0, 0), 0.011, {
      seg: 18
    }));
    // scapular blade
    g.push(G.plate(
      [p('scapSup', 0.004, -0.006, 0.006), p('scapSpineMed', 0.006, -0.014, 0.006), p('scapMed', 0.004, 0, 0.006),
       p('scapMed', 0.008, -0.048, 0.008), p('scapInf', 0.002, 0.004, 0.006)],
      [p('scapSpineLat', -0.010, -0.004, 0.006), p('scapLat', 0.000, 0.046, 0.006), p('scapLat', -0.002, 0, 0.006),
       p('scapLat', -0.012, -0.030, 0.008), p('scapInf', 0.004, 0.008, 0.008)],
      { strands: 20, r: 0.011, h: 0.16, w: 2.0, up: [0, 0, 1], color: BONE }));
    g.push(shaft(p('scapSpineMed', 0, 0.006, -0.004), p('acromion'), 0.010, { seg: 12 }));
    g.push(G.orb(p('humHead'), 0.026, [1, 1, 1], BONE, 16));
    g.push(shaft(p('humHead', 0.004, -0.02, 0), p('elbow'), 0.017, { seg: 18 }));
    g.push(shaft(p('radHead'), p('radStyloid'), 0.011, { seg: 16 }));
    g.push(shaft(p('ulnaProx', 0, 0.012, -0.016), p('ulnaStyloid'), 0.011, { seg: 16 }));
    g.push(G.orb(p('palm', 0, -0.01, 0), 0.030, [0.75, 1.15, 0.45], BONE, 14));
    for (var f = 0; f < 4; f++) {
      var dx = (f - 1.5) * 0.013;
      g.push(shaft(p('palm', dx, -0.036, 0.004), p('fingers', dx * 1.25, 0, 0.006), 0.0045, { seg: 8, rad: 7 }));
    }

    /* ---- ribs ---- */
    for (var i = 0; i < 11; i++) {
      g.push(G.belly(HB.ribPath(i), {
        r: 0.0072, endA: 0.95, endB: 0.45, bulge: 0.35, seg: 30, rad: 8,
        w: 1.6, h: 0.75, up: [0, 1, 0], color: BONE, tendon: BONE_DK
      }));
    }
    /* ---- ilium / pubis / ischium ---- */
    g.push(G.plate(
      [p('psis'), p('iliacPost'), p('iliacLat'), p('asis')],
      [p('sacrum', 0.016, -0.05, 0.01), p('ischium', 0, 0.03, 0), p('acetabulum', 0.004, -0.004, 0), p('pubicRamus', 0.01, 0.02, 0.01)],
      { strands: 20, r: 0.016, h: 0.24, w: 2.0, up: [0.4, 0, 0.9], color: BONE }));
    g.push(shaft(p('ischium'), p('pubis', 0.006, 0, 0), 0.012, { seg: 12 }));
    g.push(shaft(p('pubicRamus'), p('pubis'), 0.012, { seg: 8 }));

    /* ---- femur, patella, tibia, fibula, foot ---- */
    g.push(G.orb(p('acetabulum'), 0.022, [1, 1, 1], BONE, 14));
    g.push(shaft(p('acetabulum'), p('greaterTroch', 0, 0.006, 0), 0.015, { seg: 8 }));
    g.push(G.belly([p('greaterTroch', -0.004, -0.01, 0), p('femurMid'), p('knee', 0, 0.02, -0.004)], {
      r: 0.021, endA: 0.85, endB: 0.9, bulge: 0.4, seg: 18, rad: 12, color: BONE, tendon: BONE_DK
    }));
    g.push(G.orb(p('condyleLat', -0.006, 0, 0), 0.022, [1, 1, 1.05], BONE, 14));
    g.push(G.orb(p('condyleMed', 0.008, 0, 0), 0.021, [1, 1, 1.05], BONE, 14));
    g.push(G.orb(p('patella'), 0.020, [0.8, 1.05, 0.45], 0xd3cab2, 14));
    g.push(G.belly([p('tibPlateau'), mix('tibPlateau', 'ankle', 0.5, 0.0, 0, 0.006), p('ankle', 0, 0.01, 0.006)], {
      r: 0.017, endA: 1.05, endB: 0.8, bulge: 0.35, seg: 16, rad: 12, color: BONE, tendon: BONE_DK
    }));
    g.push(shaft(p('fibHead'), p('malleolusLat'), 0.008, { seg: 14 }));
    g.push(G.orb(p('malleolusMed'), 0.013, [1, 1.1, 1], BONE, 12));
    g.push(G.belly([p('calcaneus', 0, 0.006, -0.006), p('midfoot'), p('footFront')], {
      r: 0.026, endA: 0.75, endB: 0.45, bulge: 0.5, seg: 14, rad: 10,
      w: 0.9, h: 0.75, up: [0, 1, 0], color: BONE, tendon: BONE_DK
    }));
    return G.merge(g);
  }

  function buildAxial() {
    var g = [];
    /* skull + jaw */
    g.push(G.orb(p('skull'), 0.094, [0.94, 1.06, 1.04], 0xcdc4ac, 24));
    g.push(G.belly([p('jawAngle', -0.126, 0.004, -0.004), p('chin', 0, -0.004, 0.004), p('jawAngle', 0, 0.004, -0.004)], {
      r: 0.015, endA: 0.85, endB: 0.85, bulge: 0.4, seg: 20, rad: 9,
      w: 0.9, h: 1.1, up: [0, 1, 0], color: 0xcdc4ac, tendon: 0xbfb6a0
    }));
    /* vertebral column */
    var spine = [p('c1'), p('c4'), p('c7'), p('t3'), p('t7'), p('t12'), p('l3'), p('l5'), p('sacrum')];
    g.push(G.belly(spine, {
      r: 0.020, endA: 0.55, endB: 0.9, bulge: 0.3, seg: 60, rad: 10,
      w: 1.0, h: 1.0, up: [0, 0, 1], color: BONE, tendon: BONE_DK
    }));
    /* spinous processes */
    var curve = G.curveFrom(spine, 0.5);
    for (var i = 0; i < 22; i++) {
      var t = i / 21;
      var a = curve.getPoint(t);
      g.push(G.orb([a.x, a.y, a.z - 0.017], 0.009, [0.7, 0.9, 1.5], BONE_DK, 8));
    }
    /* sternum */
    g.push(G.belly([p('manubrium', 0, 0.03, -0.006), p('sternumMid'), p('xiphoid', 0, -0.01, -0.002)], {
      r: 0.020, endA: 0.85, endB: 0.5, bulge: 0.4, seg: 14, rad: 10,
      w: 1.0, h: 0.42, up: [1, 0, 0], color: BONE, tendon: BONE_DK
    }));
    /* sacrum */
    g.push(G.belly([p('sacrum', 0, 0.03, 0.004), p('coccyx')], {
      r: 0.032, endA: 0.95, endB: 0.35, bulge: 0.4, seg: 12, rad: 10,
      w: 1.15, h: 0.55, up: [1, 0, 0], color: BONE, tendon: BONE_DK
    }));
    return G.merge(g);
  }

  HB.buildSkeleton = function () {
    var right = buildRight();
    var left = G.mirrorX(right);
    var geo = G.merge([right, left, buildAxial()]);
    var mat = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.82, metalness: 0.0,
      color: 0xffffff, flatShading: false
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'skeleton';
    mesh.renderOrder = -1;
    return mesh;
  };
})(window);
