/*
 * retarget.js — fit the procedural anatomy to the supplied base mesh.
 *
 * The muscles and skeleton are authored against the landmark table in
 * landmarks.js, which describes one particular 1.80 m figure. The uploaded mesh
 * is a different person in a different pose: arms held further from the body,
 * a longer trunk, shorter limb segments.
 *
 * Rather than re-author every muscle, the finished geometry is warped. A short
 * list of bones pairs a segment of the authored body with the matching segment
 * measured off the uploaded mesh. Each bone contributes a rotation, a scale
 * along its own axis and a scale across it; a vertex takes a weighted blend of
 * the bones near it, so joints bend smoothly instead of tearing.
 *
 * TARGET numbers come from tools/fit-report.md — they were measured by slicing
 * the mesh and reading off joint centres and limb girths.
 */
(function (global) {
  'use strict';
  var THREE = global.THREE;
  var HB = (global.HB = global.HB || {});

  /* Joints measured on the uploaded mesh, normalised to a 1.80 m figure. */
  var TARGET = {
    shoulder: [0.240, 1.395, -0.070],
    elbow:    [0.338, 1.168, -0.062],
    wrist:    [0.437, 0.978, -0.040],
    fingers:  [0.487, 0.822, -0.030],
    hip:      [0.104, 0.850, -0.005],
    knee:     [0.142, 0.500, -0.028],
    ankle:    [0.155, 0.098, -0.062],
    toe:      [0.170, 0.012, 0.150],
    pelvis:   [0.000, 0.850, -0.020],
    shoulders:[0.000, 1.395, -0.050],
    neck:     [0.000, 1.520, -0.075],
    headTop:  [0.000, 1.800, 0.000],
    clavicle: [0.022, 1.443, 0.025]
  };
  HB.BODY_FIT = TARGET;

  function v(a) { return new THREE.Vector3(a[0], a[1], a[2]); }
  function mirror(a) { return [-a[0], a[1], a[2]]; }

  /* One bone: authored segment -> measured segment. */
  function Bone(src, dst, opts) {
    opts = opts || {};
    this.a = v(src[0]); this.b = v(src[1]);
    this.A = v(dst[0]); this.B = v(dst[1]);
    this.axis = this.b.clone().sub(this.a);
    this.len = this.axis.length();
    this.axis.divideScalar(this.len || 1);
    var Axis = this.B.clone().sub(this.A);
    this.dstLen = Axis.length();
    this.Axis = Axis.divideScalar(this.dstLen || 1);
    this.scaleAlong = opts.along != null ? opts.along : this.dstLen / (this.len || 1);
    this.scaleAcross = opts.across != null ? opts.across : 1;
    this.post = opts.post || null;     // extra world-axis scale about A
    this.weight = opts.weight || 1;
    // A bone's characteristic thickness. Distances are measured in units of it,
    // so a point 3 cm from the humerus counts as close while the same 3 cm from
    // the trunk's axis is still deep inside the chest. Without this the sheets
    // on the back get captured by a humerus passing a few centimetres away.
    this.radius = opts.radius || 0.04;
    this.rot = new THREE.Quaternion().setFromUnitVectors(this.axis, this.Axis);
  }

  var _c = new THREE.Vector3(), _q = new THREE.Vector3();
  Bone.prototype.distance = function (p) {
    var t = _q.copy(p).sub(this.a).dot(this.axis);
    t = Math.max(0, Math.min(this.len, t));
    _c.copy(this.a).addScaledVector(this.axis, t);
    return p.distanceTo(_c) / this.radius;
  };

  var _d = new THREE.Vector3(), _along = new THREE.Vector3(), _across = new THREE.Vector3();
  Bone.prototype.apply = function (p, out) {
    _d.copy(p).sub(this.a);
    var t = _d.dot(this.axis);
    _along.copy(this.axis).multiplyScalar(t * this.scaleAlong);
    _across.copy(_d).addScaledVector(this.axis, -t).multiplyScalar(this.scaleAcross);
    out.copy(_along).add(_across).applyQuaternion(this.rot).add(this.A);
    if (this.post) {
      out.x = this.A.x + (out.x - this.A.x) * this.post[0];
      out.y = this.A.y + (out.y - this.A.y) * this.post[1];
      out.z = this.A.z + (out.z - this.A.z) * this.post[2];
    }
    return out;
  };

  function Retarget(bones) {
    this.bones = bones;          // { name: [Bone, ...] }
    this.cache = {};
  }

  /* Bones are looked up by name. Restricting each body part to the bones it
     actually articulates on is what keeps the chest from being dragged
     sideways with the arm: pure distance would hand the lateral ribs to the
     humerus, which passes within a few centimetres of them. */
  Retarget.prototype.select = function (names) {
    var key = names.join('|');
    if (this.cache[key]) return this.cache[key];
    var out = [], i;
    for (i = 0; i < names.length; i++) {
      // "upperArm*0.12" lets a muscle acknowledge a bone without being dragged
      // along by it: the pectoral sheet stays on the chest wall and only its
      // tendon end follows the humerus out to an abducted arm.
      var parts = names[i].split('*');
      var list = this.bones[parts[0]];
      var w = parts.length > 1 ? parseFloat(parts[1]) : 1;
      if (!list) continue;
      for (var j = 0; j < list.length; j++) out.push({ bone: list[j], w: w });
    }
    return (this.cache[key] = out);
  };

  var _tmp = new THREE.Vector3(), _acc = new THREE.Vector3(), _p = new THREE.Vector3();
  Retarget.prototype.point = function (p, bones, out) {
    var n = bones.length, total = 0;
    _acc.set(0, 0, 0);
    var w = [];
    for (var i = 0; i < n; i++) {
      var d = bones[i].bone.distance(p);
      // Gaussian falloff in units of the bone's own thickness. A bounded weight
      // matters: with an inverse power, any vertex inside a bone's radius gets
      // an effectively infinite weight, and the per-muscle multipliers below
      // would have no say at all.
      var wi = bones[i].w * bones[i].bone.weight * Math.exp(-2.5 * d * d);
      w.push(wi); total += wi;
    }
    for (var j = 0; j < n; j++) {
      if (w[j] / total < 1e-4) continue;
      bones[j].bone.apply(p, _tmp);
      _acc.addScaledVector(_tmp, w[j] / total);
    }
    return (out || new THREE.Vector3()).copy(_acc);
  };

  Retarget.prototype.geometry = function (geo, names) {
    var bones = this.select(names && names.length ? names : Object.keys(this.bones));
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      _p.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      this.point(_p, bones, _tmp);
      pos.setXYZ(i, _tmp.x, _tmp.y, _tmp.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  };

  /* Build the named bones from the authored landmarks and the measured target.
     Only the right side and the midline are needed: bilateral muscles are built
     on the right and mirrored after warping. */
  HB.buildRetarget = function () {
    var L = HB.L, T = TARGET, bones = {};
    function set(name, src, dst, opts) { bones[name] = [new Bone(src, dst, opts)]; }

    // the trunk is two bones: the pelvis is shallower on this figure than on
    // the authored one, the chest about the same depth
    set('pelvis', [[0, 0.948, -0.020], [0, 1.120, -0.030]], [T.pelvis, [0, 1.075, -0.030]],
        { across: 1.0, post: [0.88, 1, 0.74], radius: 0.170 });
    set('thorax', [[0, 1.120, -0.030], [0, 1.400, -0.030]], [[0, 1.075, -0.030], T.shoulders],
        { across: 1.0, post: [0.88, 1, 0.93], radius: 0.180 });
    set('head', [[0, 1.452, -0.062], [0, 1.770, 0.004]], [T.neck, T.headTop],
        { across: 0.92, post: [0.94, 1, 0.90], radius: 0.110 });
    set('clavicle', [[0.022, 1.428, 0.058], L.humHead], [T.clavicle, T.shoulder],
        { across: 0.85, radius: 0.035 });
    set('upperArm', [L.humHead, L.elbow], [T.shoulder, T.elbow], { across: 0.76, radius: 0.050 });
    set('forearm', [L.elbow, L.wrist], [T.elbow, T.wrist], { across: 0.72, radius: 0.042 });
    set('hand', [L.wrist, L.fingers], [T.wrist, T.fingers], { across: 0.74, radius: 0.040 });
    set('thigh', [L.acetabulum, L.knee], [T.hip, T.knee], { across: 0.76, radius: 0.080 });
    set('shank', [L.knee, L.ankle], [T.knee, T.ankle], { across: 0.70, radius: 0.055 });
    set('foot', [L.ankle, L.toes], [T.ankle, T.toe], { across: 0.75, radius: 0.030 });

    return new Retarget(bones);
  };

  /* Which bones each region of the body is allowed to follow. */
  HB.BONES_FOR_GROUP = {
    'Head & Neck': ['head', 'thorax'],
    'Chest': ['thorax', 'clavicle*0.5', 'upperArm*0.12'],
    'Abdomen': ['thorax', 'pelvis'],
    'Back': ['thorax', 'pelvis', 'head', 'clavicle*0.5', 'upperArm*0.12'],
    'Shoulder': ['thorax', 'clavicle', 'upperArm'],
    'Arm': ['clavicle', 'upperArm', 'forearm'],
    'Forearm': ['upperArm', 'forearm', 'hand'],
    'Hip': ['pelvis', 'thigh'],
    'Thigh': ['pelvis', 'thigh', 'shank'],
    'Leg': ['thigh', 'shank', 'foot']
  };
  HB.BONES_FOR_MUSCLE = {
    trapezius: ['head', 'thorax', 'clavicle*0.6'],
    sternocleidomastoid: ['head', 'thorax', 'clavicle'],
    latissimus_dorsi: ['thorax', 'pelvis', 'upperArm*0.03'],
    pectoralis_major: ['thorax', 'clavicle*0.35', 'upperArm*0.03'],
    teres_major: ['thorax', 'clavicle*0.8', 'upperArm*0.12'],
    serratus_anterior: ['thorax', 'clavicle*0.4'],
    gastrocnemius: ['thigh', 'shank', 'foot'],
    soleus: ['shank', 'foot'],
    iliotibial_tract: ['pelvis', 'thigh', 'shank'],
    diaphragm: ['thorax'],
    intercostals: ['thorax'],
    quadratus_lumborum: ['thorax', 'pelvis'],
    erector_spinae: ['pelvis', 'thorax', 'head']
  };
  HB.bonesFor = function (def) {
    return HB.BONES_FOR_MUSCLE[def.id] || HB.BONES_FOR_GROUP[def.group] || ['trunk'];
  };

  HB.Retarget = Retarget;
})(window);
