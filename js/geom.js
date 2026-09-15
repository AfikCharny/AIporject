/*
 * geom.js — procedural anatomy geometry builders.
 *
 * Everything in this project is generated from code: no external model files.
 * Two builders do most of the work:
 *
 *   belly(points, opts)  a fusiform muscle belly swept along a spline, with
 *                        tapered tendinous ends and an elliptical cross
 *                        section (w/h let you flatten a strap muscle).
 *   fan(origin, insert, opts)
 *                        a sheet of fascicles running from an origin polyline
 *                        to an insertion polyline — pectoralis, trapezius,
 *                        latissimus, glutes, deltoid, serratus.
 *
 * Vertex colours are baked so that thin tendinous ends read pale and the
 * thick belly reads red, and a faint angular ripple hints at fascicles.
 */
(function (global) {
  'use strict';
  var THREE = global.THREE;
  var HB = (global.HB = global.HB || {});
  var G = {};

  var DEF_MUSCLE = 0xb2394a;
  var DEF_TENDON = 0xe7dcc4;

  function vec(p) {
    return Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p.clone();
  }
  G.v = vec;

  function lerpP(a, b, t) { return vec(a).lerp(vec(b), t); }
  G.lerpP = lerpP;

  function offset(p, d) {
    return new THREE.Vector3(p[0] + d[0], p[1] + d[1], p[2] + d[2]);
  }
  G.offset = offset;

  function curveFrom(points, tension) {
    var pts = points.map(vec);
    if (pts.length === 2) pts.splice(1, 0, pts[0].clone().lerp(pts[1], 0.5));
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom',
      tension == null ? 0.5 : tension);
  }
  G.curveFrom = curveFrom;

  function smoothstep(x, a, b) {
    var t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* ---------------------------------------------------------------- belly */
  G.belly = function (points, o) {
    o = Object.assign({
      r: 0.028,        // peak radius
      w: 1,            // cross-section width scale (along "right")
      h: 1,            // cross-section thickness scale (along "normal")
      endA: 0.22,      // radius fraction at the start (tendon)
      endB: 0.22,      // radius fraction at the end (tendon)
      bulge: 1.15,     // how sharply the belly swells
      peak: 0.5,       // where along the path the belly is thickest
      seg: 30,
      rad: 16,
      // up = the axis the THICKNESS (h) runs along, normally the outward
      // surface normal; the WIDTH (w) then runs across the muscle, at right
      // angles to both `up` and the path.
      up: [0, 0, 1],
      up2: null,       // optional reference vector at the far end
      twist: 0,        // radians of twist from start to end
      tension: 0.5,
      color: DEF_MUSCLE,
      tendon: DEF_TENDON,
      tendonAt: 0.22,       // below this profile the surface reads as tendon
      tendonBias: 0.20,
      fascicles: 7,
      rFn: null        // optional t -> extra radius multiplier
    }, o || {});

    var curve = curveFrom(points, o.tension);
    var upA = vec(o.up).normalize();
    var upB = o.up2 ? vec(o.up2).normalize() : upA;
    var seg = o.seg, rad = o.rad;

    var kPeak = Math.log(0.5) / Math.log(THREE.MathUtils.clamp(o.peak, 0.06, 0.94));

    function prof(t) {
      var tw = Math.pow(THREE.MathUtils.clamp(t, 0, 1), kPeak);
      var s = Math.pow(Math.sin(Math.PI * tw), o.bulge);
      var ends = o.endA + (o.endB - o.endA) * t;
      return ends + (1 - ends) * s;
    }

    var pos = [], col = [], idx = [];
    // colours are authored in sRGB; the renderer works in linear space
    var cMus = new THREE.Color(o.color).convertSRGBToLinear();
    var cTen = new THREE.Color(o.tendon).convertSRGBToLinear();
    var P = new THREE.Vector3(), T = new THREE.Vector3(),
        R = new THREE.Vector3(), N = new THREE.Vector3(), U = new THREE.Vector3();
    var tmp = new THREE.Color();

    for (var i = 0; i <= seg; i++) {
      var t = i / seg;
      curve.getPointAt ? curve.getPointAt(t, P) : curve.getPoint(t, P);
      T.copy(curve.getTangentAt ? curve.getTangentAt(t) : curve.getTangent(t)).normalize();
      U.copy(upA).lerp(upB, t).normalize();
      R.crossVectors(U, T);
      if (R.lengthSq() < 1e-8) { R.set(1, 0, 0).cross(T); }
      R.normalize();
      N.crossVectors(T, R).normalize();

      var pr = prof(t) * (o.rFn ? o.rFn(t) : 1);
      var a = o.r * pr * o.w;
      var b = o.r * pr * o.h;
      var tw = o.twist * t;

      // tendon <-> belly colour blend
      var mixv = smoothstep(pr, o.tendonAt, o.tendonAt + o.tendonBias);
      for (var j = 0; j < rad; j++) {
        var th = (j / rad) * Math.PI * 2 + tw;
        var ca = Math.cos(th), sa = Math.sin(th);
        pos.push(
          P.x + R.x * a * ca + N.x * b * sa,
          P.y + R.y * a * ca + N.y * b * sa,
          P.z + R.z * a * ca + N.z * b * sa
        );
        var groove = 1 - 0.09 * Math.pow(Math.abs(Math.sin(th * o.fascicles * 0.5)), 6);
        tmp.copy(cTen).lerp(cMus, mixv).multiplyScalar(groove * (0.97 + 0.03 * Math.sin(t * 40)));
        col.push(tmp.r, tmp.g, tmp.b);
      }
    }
    for (var i2 = 0; i2 < seg; i2++) {
      for (var j2 = 0; j2 < rad; j2++) {
        var j3 = (j2 + 1) % rad;
        var A = i2 * rad + j2, B = i2 * rad + j3;
        var C = (i2 + 1) * rad + j2, D = (i2 + 1) * rad + j3;
        idx.push(A, C, B, B, C, D);
      }
    }
    // caps
    var base = pos.length / 3;
    var p0 = curve.getPoint(0), p1 = curve.getPoint(1);
    var capC = new THREE.Color(o.tendon).convertSRGBToLinear();
    pos.push(p0.x, p0.y, p0.z); col.push(capC.r, capC.g, capC.b);
    pos.push(p1.x, p1.y, p1.z); col.push(capC.r, capC.g, capC.b);
    for (var j4 = 0; j4 < rad; j4++) {
      var jn = (j4 + 1) % rad;
      idx.push(base, j4, jn);
      idx.push(base + 1, seg * rad + jn, seg * rad + j4);
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  };

  /* ------------------------------------------------------------- polyline */
  function polyPoint(pts, s) {
    if (pts.length === 1) return vec(pts[0]);
    var x = THREE.MathUtils.clamp(s, 0, 1) * (pts.length - 1);
    var i = Math.min(Math.floor(x), pts.length - 2);
    return lerpP(pts[i], pts[i + 1], x - i);
  }
  G.polyPoint = polyPoint;

  /* ------------------------------------------------------------------ fan */
  /* A sheet of fascicles: origin polyline -> insertion polyline. */
  G.fan = function (originPts, insertPts, o) {
    o = Object.assign({
      strands: 7,
      r: 0.016,
      w: 2.1,
      h: 0.60,
      endA: 0.72,
      endB: 0.46,
      bulge: 0.72,
      peak: 0.45,
      arch: [0, 0, 0],   // extra offset applied at the middle of each fascicle
      archOut: 0,        // push the middle away from the body surface
      depth: 2.4,        // the trunk is wider than it is deep; this weights the
                         // surface normal so that back muscles lie flat on the
                         // back rather than facing sideways
      seg: 22,
      rad: 10,
      up: null,          // defaults to outward from the body axis
      color: DEF_MUSCLE,
      tendon: DEF_TENDON,
      spreadIn: 0,       // jitter of insertion points across the strands
      curve: 0,          // lateral sway of the mid control point
      rFnStrand: null,
      map: null          // strand s -> insertion s
    }, o || {});

    var geos = [];
    var n = o.strands;
    for (var k = 0; k < n; k++) {
      var s = n === 1 ? 0.5 : k / (n - 1);
      var a = polyPoint(originPts, s);
      var b = polyPoint(insertPts, o.map ? o.map(s) : s);
      if (o.spreadIn) {
        b.x += (Math.sin(s * 7.3) * o.spreadIn);
        b.y += (Math.cos(s * 5.1) * o.spreadIn * 0.6);
      }
      var mid = a.clone().lerp(b, 0.5);
      var swell = Math.sin(Math.PI * (0.15 + 0.7 * s));
      mid.add(new THREE.Vector3(o.arch[0], o.arch[1], o.arch[2]).multiplyScalar(swell));
      var out = G.surfaceNormal(mid, o.depth);
      if (o.archOut) mid.add(out.clone().multiplyScalar(o.archOut * swell));
      if (o.curve) {
        var dir = b.clone().sub(a).normalize();
        var side = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
        mid.add(side.multiplyScalar(o.curve * swell));
      }
      var up = o.up ? vec(o.up) : out.clone().setY(0.10).normalize();
      var rr = o.r * (o.rFnStrand ? o.rFnStrand(s) : 1);
      geos.push(G.belly([a, mid, b], {
        r: rr, w: o.w, h: o.h, endA: o.endA, endB: o.endB, bulge: o.bulge,
        peak: o.peak, seg: o.seg, rad: o.rad, up: up, color: o.color,
        tendon: o.tendon, fascicles: 5
      }));
    }
    return G.merge(geos);
  };

  /* Outward normal of the trunk at a point, treating the body as an ellipse
     in cross-section (wider than deep). */
  G.surfaceNormal = function (pt, depth) {
    var k = depth == null ? 2.4 : depth;
    var n = new THREE.Vector3(pt.x, 0, (pt.z + 0.02) * k);
    if (n.lengthSq() < 1e-8) n.set(0, 0, 1);
    return n.normalize();
  };

  /* ---------------------------------------------------------------- plate */
  /* A flat bony plate spanning two polylines (scapula, ilium, sternum). */
  G.plate = function (edgeA, edgeB, o) {
    o = Object.assign({ strands: 18, r: 0.012, w: 1.9, h: 0.34, endA: 0.75,
      endB: 0.75, bulge: 0.45, seg: 16, rad: 8, up: [0, 0, 1],
      color: 0xe8e2d2, tendon: 0xe8e2d2 }, o || {});
    var geos = [];
    for (var k = 0; k < o.strands; k++) {
      var s = o.strands === 1 ? 0.5 : k / (o.strands - 1);
      var a = polyPoint(edgeA, s), b = polyPoint(edgeB, s);
      geos.push(G.belly([a, a.clone().lerp(b, 0.5), b], {
        r: o.r, w: o.w, h: o.h, endA: o.endA, endB: o.endB, bulge: o.bulge,
        seg: o.seg, rad: o.rad, up: o.up, color: o.color, tendon: o.tendon
      }));
    }
    return G.merge(geos);
  };

  /* ------------------------------------------------------------------ orb */
  G.orb = function (center, radius, scale, color, detail) {
    var geo = new THREE.SphereGeometry(radius, detail || 20, (detail || 20) / 2);
    geo.scale(scale[0], scale[1], scale[2]);
    geo.translate(center[0], center[1], center[2]);
    var c = new THREE.Color(color == null ? 0xe8e2d2 : color).convertSRGBToLinear();
    var n = geo.attributes.position.count, arr = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return geo;
  };

  /* ---------------------------------------------------------------- merge */
  G.merge = function (geos) {
    var total = 0, i;
    var expanded = geos.map(function (g) {
      return g.index ? g.toNonIndexed() : g;
    });
    for (i = 0; i < expanded.length; i++) total += expanded[i].attributes.position.count;
    var pos = new Float32Array(total * 3),
        nor = new Float32Array(total * 3),
        col = new Float32Array(total * 3);
    var off = 0;
    for (i = 0; i < expanded.length; i++) {
      var g = expanded[i];
      if (!g.attributes.normal) g.computeVertexNormals();
      pos.set(g.attributes.position.array, off * 3);
      nor.set(g.attributes.normal.array, off * 3);
      if (g.attributes.color) col.set(g.attributes.color.array, off * 3);
      else col.fill(1, off * 3, off * 3 + g.attributes.position.count * 3);
      off += g.attributes.position.count;
      g.dispose();
    }
    var out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return out;
  };

  /* -------------------------------------------------------------- mirrorX */
  G.mirrorX = function (geo) {
    var g = geo.clone();
    g.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
    if (g.index) {
      var idx = g.index.array;
      for (var i = 0; i < idx.length; i += 3) {
        var t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t;
      }
      g.index.needsUpdate = true;
    } else {
      var p = g.attributes.position.array;
      for (var j = 0; j < p.length; j += 9) {
        for (var c = 0; c < 3; c++) {
          var tv = p[j + c]; p[j + c] = p[j + 6 + c]; p[j + 6 + c] = tv;
        }
      }
      g.attributes.position.needsUpdate = true;
      var col = g.attributes.color;
      if (col) {
        var a = col.array;
        for (var j2 = 0; j2 < a.length; j2 += 9) {
          for (var c2 = 0; c2 < 3; c2++) {
            var tc = a[j2 + c2]; a[j2 + c2] = a[j2 + 6 + c2]; a[j2 + 6 + c2] = tc;
          }
        }
        col.needsUpdate = true;
      }
    }
    g.computeVertexNormals();
    return g;
  };

  /* ------------------------------------------------------------- centroid */
  G.centroid = function (geo) {
    geo.computeBoundingBox();
    return geo.boundingBox.getCenter(new THREE.Vector3());
  };

  HB.G = G;
})(window);
