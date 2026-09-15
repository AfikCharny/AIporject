/*
 * skin.js — the outer body surface.
 *
 * The figure's skin is an implicit surface: about seventy rounded cones and
 * ellipsoids are blended with a smooth union so that limbs flow into the trunk
 * without seams, then the field is polygonised with naive surface nets. That
 * gives an organic body whose proportions come from the same landmark table the
 * muscles use, so the muscles sit inside it.
 *
 * Everything here is plain arithmetic on a Float32Array; it takes well under a
 * second to build a body of roughly 60,000 triangles.
 */
(function (global) {
  'use strict';
  var HB = global.HB, THREE = global.THREE;
  var L = HB.L;

  /* ------------------------------------------------------------ the field */

  /* A rounded cone: a segment from a to b whose radius sweeps r1 -> r2.
     `squash` scales the space around it, so one primitive can be an ellipse in
     cross-section (the trunk is much wider than it is deep). */
  function cone(a, b, r1, r2, squash, blend) {
    var k = squash || [1, 1, 1];
    var kx = 1 / k[0], ky = 1 / k[1], kz = 1 / k[2];
    var bx = (b[0] - a[0]) * kx, by = (b[1] - a[1]) * ky, bz = (b[2] - a[2]) * kz;
    var len2 = bx * bx + by * by + bz * bz;
    var kmax = Math.max(kx, ky, kz);
    var rmax = Math.max(r1, r2);
    return {
      ax: a[0], ay: a[1], az: a[2], kx: kx, ky: ky, kz: kz,
      bx: bx, by: by, bz: bz, len2: len2 || 1e-9,
      r1: r1, dr: r2 - r1, inv: 1 / kmax, blend: blend == null ? 0.045 : blend,
      min: [Math.min(a[0], b[0]) - rmax * k[0], Math.min(a[1], b[1]) - rmax * k[1],
            Math.min(a[2], b[2]) - rmax * k[2]],
      max: [Math.max(a[0], b[0]) + rmax * k[0], Math.max(a[1], b[1]) + rmax * k[1],
            Math.max(a[2], b[2]) + rmax * k[2]]
    };
  }
  function blob(c, r, squash, blend) { return cone(c, c, r, r, squash, blend); }
  function carve(prim) { prim.sub = true; return prim; }

  function dist(p0, p1, p2, s) {
    var dx = (p0 - s.ax) * s.kx, dy = (p1 - s.ay) * s.ky, dz = (p2 - s.az) * s.kz;
    var t = (dx * s.bx + dy * s.by + dz * s.bz) / s.len2;
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    var ex = dx - s.bx * t, ey = dy - s.by * t, ez = dz - s.bz * t;
    return (Math.sqrt(ex * ex + ey * ey + ez * ez) - (s.r1 + s.dr * t)) * s.inv;
  }

  /* --------------------------------------------------------- the body plan */

  function mirror(p) { return [-p[0], p[1], p[2]]; }

  /* The head is polygonised separately and finely: a nose, lips and eye
     sockets are 10-20 mm features that the body's grid would erase. */
  function headParts() {
    var P = [];
    function add(p) { P.push(p); }
    function both(p, mirrored) { add(p); add(mirrored); }

    /* An anatomical mannequin head: correct proportions and a calm, neutral
       face, the convention in anatomy atlases. Chin 1.565, crown 1.775, eyes
       on the midline at 1.666. */
    add(blob([0, 1.688, -0.022], 0.084, [0.88, 0.99, 1.02], 0.024));     // cranium
    add(blob([0, 1.646, 0.026], 0.062, [1.00, 0.98, 0.80], 0.022));      // face
    both(cone([0.057, 1.634, -0.022], [0, 1.581, 0.055], 0.018, 0.018, [1, 0.82, 1], 0.018),
         cone([-0.057, 1.634, -0.022], [0, 1.581, 0.055], 0.018, 0.018, [1, 0.82, 1], 0.018)); // mandible
    add(blob([0, 1.583, 0.060], 0.018, [1.15, 0.82, 0.95], 0.014));      // chin
    both(blob([0.048, 1.646, 0.038], 0.019, [1.00, 0.95, 0.82], 0.014),  // cheek
         blob([-0.048, 1.646, 0.038], 0.019, [1.00, 0.95, 0.82], 0.014));
    add(cone([0, 1.680, 0.058], [0, 1.626, 0.080], 0.011, 0.012, [0.70, 1, 1], 0.006)); // nose bridge
    add(blob([0, 1.620, 0.086], 0.0115, [1.20, 0.80, 0.90], 0.005));     // nose tip
    add(blob([0, 1.690, 0.060], 0.016, [2.10, 0.36, 0.72], 0.008));      // brow ridge
    both(blob([0.074, 1.658, -0.024], 0.023, [0.22, 1.20, 0.90], 0.006), // ear
         blob([-0.074, 1.658, -0.024], 0.023, [0.22, 1.20, 0.90], 0.006));
    // shallow orbits with closed lids over them
    both(carve(blob([0.030, 1.6660, 0.074], 0.015, [1.30, 0.85, 1], 0.008)),
         carve(blob([-0.030, 1.6660, 0.074], 0.015, [1.30, 0.85, 1], 0.008)));
    both(blob([0.030, 1.6655, 0.060], 0.0125, [1.35, 0.78, 0.72], 0.006),
         blob([-0.030, 1.6655, 0.060], 0.0125, [1.35, 0.78, 0.72], 0.006));
    add(carve(blob([0, 1.5975, 0.088], 0.007, [2.30, 0.30, 1.00], 0.005)));  // mouth line
    // the neck runs behind the jaw so chin and throat stay distinct
    add(cone([0, 1.352, -0.034], [0, 1.560, -0.036], 0.082, 0.047, [1, 1, 0.94], 0.028));
    add(cone([0, 1.588, -0.044], [0, 1.640, -0.058], 0.046, 0.038, [1.1, 1, 0.9], 0.022)); // nape
    add(blob([0, 1.566, 0.000], 0.025, [1.2, 0.9, 0.9], 0.020));         // throat
    return P;
  }

  function bodyParts() {
    var P = [];
    function add(prim) { P.push(prim); }
    function pair(a, b, r1, r2, squash, blend) {
      add(cone(a, b, r1, r2, squash, blend));
      add(cone(mirror(a), mirror(b), r1, r2, squash, blend));
    }

    /* Radii come from measuring the finished anatomy band by band, then
       allowing for skin and fat over it. */

    /* The head is a separate, finer mesh (see headParts); the body carries a
       slim neck stub that stays inside it, so the two never fight. */
    add(cone([0, 1.410, -0.020], [0, 1.540, -0.018], 0.058, 0.044, [1, 1, 0.94], 0.04));

    /* ---- trunk ---- */
    add(cone([0, 1.298, -0.006], [0, 1.406, -0.010], 0.150, 0.154, [1, 0.9, 0.76], 0.06)); // upper chest
    add(cone([0, 1.190, -0.004], [0, 1.298, -0.006], 0.136, 0.150, [1, 1, 0.74], 0.06));   // lower chest
    add(cone([0, 1.080, -0.002], [0, 1.190, -0.004], 0.124, 0.136, [1, 1, 0.74], 0.06));   // waist
    add(cone([0, 0.990, -0.008], [0, 1.080, -0.002], 0.142, 0.124, [1, 0.72, 0.76], 0.06)); // hips
    add(cone([0, 0.946, -0.012], [0, 0.990, -0.008], 0.140, 0.142, [1, 0.58, 0.80], 0.06)); // seat
    add(blob([0, 1.336, 0.048], 0.082, [1.35, 0.62, 0.58], 0.05));                         // pectoral swell
    pair([0.074, 0.968, -0.074], [0.074, 0.968, -0.074], 0.070, 0.070, [1, 0.80, 0.74], 0.05); // buttock
    add(blob([0, 0.938, 0.020], 0.056, [1.10, 0.72, 1.0], 0.045));                          // pelvic front
    pair([0.146, 1.368, -0.006], [0.172, 1.384, -0.008], 0.070, 0.074, [1, 1, 0.92], 0.05); // shoulder cap

    /* ---- arms ---- */
    pair([0.180, 1.356, -0.004], [0.214, 1.114, -0.004], 0.062, 0.046, [1, 1, 0.94], 0.04);
    pair([0.218, 1.102, 0.000], [0.262, 0.872, 0.008], 0.052, 0.033, [1, 1, 0.95], 0.035);
    pair([0.264, 0.858, 0.010], [0.268, 0.778, 0.016], 0.035, 0.039, [1, 1, 0.58], 0.030); // palm
    pair([0.268, 0.778, 0.018], [0.272, 0.684, 0.022], 0.039, 0.021, [1, 1, 0.52], 0.028); // fingers
    pair([0.248, 0.780, 0.030], [0.240, 0.758, 0.044], 0.021, 0.015, [1, 1, 0.8], 0.022);  // thumb

    /* ---- legs ---- */
    pair([0.100, 0.940, 0.000], [0.096, 0.720, 0.004], 0.088, 0.080, [1, 1, 0.92], 0.05);
    pair([0.096, 0.720, 0.004], [0.096, 0.512, 0.004], 0.080, 0.060, [1, 1, 0.94], 0.045);
    pair([0.094, 0.512, 0.002], [0.092, 0.380, -0.004], 0.060, 0.062, [1, 1, 0.95], 0.045);
    pair([0.094, 0.372, -0.020], [0.092, 0.300, -0.012], 0.062, 0.052, [1, 1, 0.92], 0.04); // calf
    pair([0.090, 0.300, -0.006], [0.086, 0.104, -0.006], 0.050, 0.035, [1, 1, 0.96], 0.04);
    pair([0.086, 0.066, -0.052], [0.088, 0.036, 0.054], 0.042, 0.032, [0.86, 0.85, 1], 0.035); // foot
    pair([0.088, 0.030, 0.054], [0.090, 0.024, 0.106], 0.032, 0.021, [0.92, 0.75, 1], 0.03); // toes

    return P;
  }

  /* ------------------------------------------- distance field of the model */

  /* Voxelise the finished anatomy, then chamfer-transform it into a distance
     field. Unioning the body plan with "12 mm outside the anatomy" guarantees
     no muscle can ever poke through the skin, and lets the real muscle mass
     shape the surface the way it does on a person. */
  function AnatomyField(meshes, bounds, step, blur, skipAbove) {
    var nx = this.nx = Math.ceil((bounds.max[0] - bounds.min[0]) / step) + 1;
    var ny = this.ny = Math.ceil((bounds.max[1] - bounds.min[1]) / step) + 1;
    var nz = this.nz = Math.ceil((bounds.max[2] - bounds.min[2]) / step) + 1;
    this.step = step;
    this.min = bounds.min;
    var FAR = 9;
    var d = this.d = new Float32Array(nx * ny * nz).fill(FAR);
    var si = ny * nz, sj = nz;

    var v = new THREE.Vector3();
    for (var m = 0; m < meshes.length; m++) {
      var mesh = meshes[m];
      mesh.updateMatrixWorld();
      var attr = mesh.geometry.attributes.position, mat = mesh.matrixWorld;
      for (var i = 0; i < attr.count; i++) {
        v.fromBufferAttribute(attr, i).applyMatrix4(mat);
        var x = Math.round((v.x - bounds.min[0]) / step);
        var y = Math.round((v.y - bounds.min[1]) / step);
        var z = Math.round((v.z - bounds.min[2]) / step);
        if (skipAbove && v.y > skipAbove) continue;
        if (x < 0 || y < 0 || z < 0 || x >= nx || y >= ny || z >= nz) continue;
        d[x * si + y * sj + z] = 0;
      }
    }

    // two-pass chamfer distance transform
    var w1 = step, w2 = step * 1.4142, w3 = step * 1.7321;
    var off = [], k;
    for (var dx = -1; dx <= 1; dx++)
      for (var dy = -1; dy <= 1; dy++)
        for (var dz = -1; dz <= 1; dz++) {
          var n = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
          if (!n) continue;
          off.push([dx, dy, dz, n === 1 ? w1 : (n === 2 ? w2 : w3)]);
        }
    var fwd = off.filter(function (o) {
      return o[0] < 0 || (o[0] === 0 && (o[1] < 0 || (o[1] === 0 && o[2] < 0)));
    });
    var bwd = off.filter(function (o) { return fwd.indexOf(o) < 0; });

    function sweep(list, rev) {
      var x, y, z, xs = rev ? nx - 1 : 0, xe = rev ? -1 : nx, xd = rev ? -1 : 1;
      var ys = rev ? ny - 1 : 0, ye = rev ? -1 : ny, yd = rev ? -1 : 1;
      var zs = rev ? nz - 1 : 0, ze = rev ? -1 : nz, zd = rev ? -1 : 1;
      for (x = xs; x !== xe; x += xd)
        for (y = ys; y !== ye; y += yd)
          for (z = zs; z !== ze; z += zd) {
            var idx = x * si + y * sj + z, best = d[idx];
            if (best === 0) continue;
            for (var o = 0; o < list.length; o++) {
              var ox = x + list[o][0], oy = y + list[o][1], oz = z + list[o][2];
              if (ox < 0 || oy < 0 || oz < 0 || ox >= nx || oy >= ny || oz >= nz) continue;
              var cand = d[ox * si + oy * sj + oz] + list[o][3];
              if (cand < best) best = cand;
            }
            d[idx] = best;
          }
    }
    sweep(fwd, false);
    sweep(bwd, true);

    // separable blur, so individual fascicles don't emboss the skin
    var tmp = new Float32Array(d.length);
    for (var pass = 0; pass < (blur || 2); pass++) {
      for (var axis = 0; axis < 3; axis++) {
        var stride = axis === 0 ? si : (axis === 1 ? sj : 1);
        var lim = axis === 0 ? nx : (axis === 1 ? ny : nz);
        for (var a = 0; a < nx; a++)
          for (var b = 0; b < ny; b++)
            for (var c = 0; c < nz; c++) {
              var id2 = a * si + b * sj + c;
              var pi = axis === 0 ? a : (axis === 1 ? b : c);
              var lo = pi > 0 ? d[id2 - stride] : d[id2];
              var hi = pi < lim - 1 ? d[id2 + stride] : d[id2];
              tmp[id2] = (lo + 2 * d[id2] + hi) * 0.25;
            }
        d.set(tmp);
      }
    }
  }

  AnatomyField.prototype.at = function (x, y, z) {
    var fx = (x - this.min[0]) / this.step, fy = (y - this.min[1]) / this.step,
        fz = (z - this.min[2]) / this.step;
    var ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
    if (ix < 0 || iy < 0 || iz < 0 || ix >= this.nx - 1 || iy >= this.ny - 1 || iz >= this.nz - 1) return 9;
    var tx = fx - ix, ty = fy - iy, tz = fz - iz;
    var si = this.ny * this.nz, sj = this.nz, d = this.d;
    var b = ix * si + iy * sj + iz;
    function mix(a2, b2, t) { return a2 + (b2 - a2) * t; }
    var c00 = mix(d[b], d[b + si], tx), c10 = mix(d[b + sj], d[b + sj + si], tx);
    var c01 = mix(d[b + 1], d[b + 1 + si], tx), c11 = mix(d[b + sj + 1], d[b + sj + 1 + si], tx);
    return mix(mix(c00, c10, ty), mix(c01, c11, ty), tz);
  };

  /* ------------------------------------------------------ field evaluation */

  function Field(parts, bounds, anatomy, offset) {
    this.parts = parts;
    this.bounds = bounds;
    this.anatomy = anatomy || null;
    this.offset = offset == null ? 0.009 : offset;
    // bucket the primitives so a sample only tests what is near it
    var bx = this.bx = 10, by = this.by = 26, bz = this.bz = 6;
    this.sx = (bounds.max[0] - bounds.min[0]) / bx;
    this.sy = (bounds.max[1] - bounds.min[1]) / by;
    this.sz = (bounds.max[2] - bounds.min[2]) / bz;
    var buckets = this.buckets = new Array(bx * by * bz);
    for (var i = 0; i < buckets.length; i++) buckets[i] = null;
    for (var p = 0; p < parts.length; p++) {
      var s = parts[p], pad = s.blend * 3 + 0.01;
      var i0 = Math.max(0, Math.floor((s.min[0] - pad - bounds.min[0]) / this.sx));
      var i1 = Math.min(bx - 1, Math.floor((s.max[0] + pad - bounds.min[0]) / this.sx));
      var j0 = Math.max(0, Math.floor((s.min[1] - pad - bounds.min[1]) / this.sy));
      var j1 = Math.min(by - 1, Math.floor((s.max[1] + pad - bounds.min[1]) / this.sy));
      var k0 = Math.max(0, Math.floor((s.min[2] - pad - bounds.min[2]) / this.sz));
      var k1 = Math.min(bz - 1, Math.floor((s.max[2] + pad - bounds.min[2]) / this.sz));
      for (var i2 = i0; i2 <= i1; i2++)
        for (var j = j0; j <= j1; j++)
          for (var k = k0; k <= k1; k++) {
            var idx = (i2 * by + j) * bz + k;
            (buckets[idx] || (buckets[idx] = [])).push(s);
          }
    }
  }

  Field.prototype.at = function (x, y, z) {
    var b = this.bounds;
    var i = Math.floor((x - b.min[0]) / this.sx);
    var j = Math.floor((y - b.min[1]) / this.sy);
    var k = Math.floor((z - b.min[2]) / this.sz);
    if (i < 0 || j < 0 || k < 0 || i >= this.bx || j >= this.by || k >= this.bz) return 1;
    var list = this.buckets[(i * this.by + j) * this.bz + k];
    var d = 1e9, n;
    if (list) {
      for (n = 0; n < list.length; n++) {
        var s = list[n], dn = dist(x, y, z, s), kk = s.blend, h;
        if (s.sub) {
          // smooth subtraction — hollows out the eye sockets
          if (d > 1e8) continue;
          h = 0.5 - 0.5 * (d + dn) / kk;
          h = h < 0 ? 0 : (h > 1 ? 1 : h);
          d = d + (-dn - d) * h + kk * h * (1 - h);
          continue;
        }
        if (d > 1e8) { d = dn; continue; }
        // smooth (polynomial) union keeps limbs flowing into the trunk
        h = 0.5 + 0.5 * (d - dn) / kk;
        h = h < 0 ? 0 : (h > 1 ? 1 : h);
        d = d + (dn - d) * h - kk * h * (1 - h);
      }
    }
    if (this.anatomy) {
      var da = this.anatomy.at(x, y, z) - this.offset;
      if (d > 1e8) return da;
      var k2 = 0.014;
      var h2 = 0.5 + 0.5 * (d - da) / k2;
      h2 = h2 < 0 ? 0 : (h2 > 1 ? 1 : h2);
      d = d + (da - d) * h2 - k2 * h2 * (1 - h2);
    } else if (d > 1e8) return 1;
    return d;
  };

  /* ----------------------------------------------------- polygonisation */

  var CORNER = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
  var EDGE = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

  function surfaceNets(field, nx, ny, nz, org, step) {
    var vals = new Float32Array(nx * ny * nz);
    var si = ny * nz, sj = nz;
    var x, y, z, n = 0;
    for (x = 0; x < nx; x++) {
      var wx = org[0] + x * step;
      for (y = 0; y < ny; y++) {
        var wy = org[1] + y * step;
        for (z = 0; z < nz; z++) {
          vals[n++] = field.at(wx, wy, org[2] + z * step);
        }
      }
    }

    var cx = nx - 1, cy = ny - 1, cz = nz - 1;
    var cell = new Int32Array(cx * cy * cz).fill(-1);
    var pos = [];
    var cv = new Float32Array(8);
    for (x = 0; x < cx; x++) {
      for (y = 0; y < cy; y++) {
        for (z = 0; z < cz; z++) {
          var base = x * si + y * sj + z, neg = 0, c;
          for (c = 0; c < 8; c++) {
            var v = vals[base + CORNER[c][0] * si + CORNER[c][1] * sj + CORNER[c][2]];
            cv[c] = v;
            if (v < 0) neg++;
          }
          if (neg === 0 || neg === 8) continue;
          var px = 0, py = 0, pz = 0, cnt = 0;
          for (var e = 0; e < 12; e++) {
            var a = EDGE[e][0], b = EDGE[e][1], va = cv[a], vb = cv[b];
            if ((va < 0) === (vb < 0)) continue;
            var t = va / (va - vb);
            px += CORNER[a][0] + (CORNER[b][0] - CORNER[a][0]) * t;
            py += CORNER[a][1] + (CORNER[b][1] - CORNER[a][1]) * t;
            pz += CORNER[a][2] + (CORNER[b][2] - CORNER[a][2]) * t;
            cnt++;
          }
          cell[(x * cy + y) * cz + z] = pos.length / 3;
          pos.push(org[0] + (x + px / cnt) * step,
                   org[1] + (y + py / cnt) * step,
                   org[2] + (z + pz / cnt) * step);
        }
      }
    }

    // one quad per sign-changing grid edge, joining the four cells around it
    var idx = [];
    /* Wind each quad so its front face points out of the surface, which is
       the direction the field's gradient increases. */
    function quad(a, b, c, d, flip) {
      if (a < 0 || b < 0 || c < 0 || d < 0) return;
      if (flip) idx.push(a, b, c, a, c, d);
      else idx.push(a, c, b, a, d, c);
    }
    function cellAt(x, y, z) {
      if (x < 0 || y < 0 || z < 0 || x >= cx || y >= cy || z >= cz) return -1;
      return cell[(x * cy + y) * cz + z];
    }
    for (x = 0; x < nx; x++) {
      for (y = 0; y < ny; y++) {
        for (z = 0; z < nz; z++) {
          var b0 = vals[x * si + y * sj + z] < 0;
          if (x + 1 < nx && y > 0 && z > 0) {
            var b1 = vals[(x + 1) * si + y * sj + z] < 0;
            if (b0 !== b1) quad(cellAt(x, y - 1, z - 1), cellAt(x, y, z - 1),
                                cellAt(x, y, z), cellAt(x, y - 1, z), b0);
          }
          if (y + 1 < ny && x > 0 && z > 0) {
            var b2 = vals[x * si + (y + 1) * sj + z] < 0;
            if (b0 !== b2) quad(cellAt(x - 1, y, z - 1), cellAt(x, y, z - 1),
                                cellAt(x, y, z), cellAt(x - 1, y, z), !b0);
          }
          if (z + 1 < nz && x > 0 && y > 0) {
            var b3 = vals[x * si + y * sj + z + 1] < 0;
            if (b0 !== b3) quad(cellAt(x - 1, y - 1, z), cellAt(x, y - 1, z),
                                cellAt(x, y, z), cellAt(x - 1, y, z), b0);
          }
        }
      }
    }
    return { position: pos, index: idx };
  }

  /* Taubin smoothing: alternate a shrinking pass with a slightly larger
     expanding one, which removes the sampling bumps and the emboss of
     individual fascicles without deflating the body. */
  function relax(pos, idx, passes, weight) {
    var n = pos.length / 3;
    var accum = new Float32Array(n * 3), count = new Uint16Array(n);
    for (var p = 0; p < passes; p++) {
      var w = (p % 2 === 0) ? weight : -weight * 1.05;
      accum.fill(0); count.fill(0);
      for (var i = 0; i < idx.length; i += 3) {
        for (var e = 0; e < 3; e++) {
          var a = idx[i + e], b = idx[i + (e + 1) % 3];
          accum[a * 3] += pos[b * 3]; accum[a * 3 + 1] += pos[b * 3 + 1]; accum[a * 3 + 2] += pos[b * 3 + 2];
          accum[b * 3] += pos[a * 3]; accum[b * 3 + 1] += pos[a * 3 + 1]; accum[b * 3 + 2] += pos[a * 3 + 2];
          count[a]++; count[b]++;
        }
      }
      for (var v = 0; v < n; v++) {
        if (!count[v]) continue;
        for (var c = 0; c < 3; c++) {
          var avg = accum[v * 3 + c] / count[v];
          pos[v * 3 + c] += (avg - pos[v * 3 + c]) * w;
        }
      }
    }
  }

  /* ------------------------------------------------------------- assembly */

  var SKIN = new THREE.Color(0xc98d6e).convertSRGBToLinear();
  var HAIR = new THREE.Color(0x2e2018).convertSRGBToLinear();
  var LIP = new THREE.Color(0xb06a5c).convertSRGBToLinear();

  function smoothstep(a, b, x) {
    var t = (x - a) / (b - a);
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    return t * t * (3 - 2 * t);
  }

  /* Hair, brows and lips are painted on rather than modelled: at this mesh
     resolution a modelled hairline reads as a helmet, while a painted one
     follows the skull exactly. */
  function paintHead(x, y, z, c) {
    c.copy(SKIN);
    // hairline: high over the brow, dropping down the back of the skull
    var line = 1.7075 + 0.055 * (z - 0.02) - 0.16 * Math.max(0, Math.abs(x) - 0.055);
    var hair = smoothstep(line - 0.006, line + 0.006, y);
    if (z < -0.02) hair = Math.max(hair, smoothstep(1.638, 1.652, y) * smoothstep(-0.02, -0.05, z));
    // brows
    var brow = smoothstep(0.030, 0.018, Math.abs(Math.abs(x) - 0.030)) *
               smoothstep(0.0075, 0.0035, Math.abs(y - 1.6805)) *
               smoothstep(0.035, 0.055, z);
    var lips = smoothstep(0.019, 0.010, Math.abs(x)) *
               smoothstep(0.009, 0.004, Math.abs(y - 1.5975)) *
               smoothstep(0.062, 0.076, z);
    c.lerp(LIP, lips * 0.55);
    c.lerp(HAIR, Math.min(1, hair + brow * 0.9));
    return c;
  }

  function polygonise(field, bounds, step, smoothing, paint) {
    var nx = Math.ceil((bounds.max[0] - bounds.min[0]) / step) + 1;
    var ny = Math.ceil((bounds.max[1] - bounds.min[1]) / step) + 1;
    var nz = Math.ceil((bounds.max[2] - bounds.min[2]) / step) + 1;
    var m = surfaceNets(field, nx, ny, nz, bounds.min, step);
    var pos = new Float32Array(m.position);
    relax(pos, m.index, smoothing.passes, smoothing.weight);
    var nor = new Float32Array(pos.length);
    var col = new Float32Array(pos.length);
    var tmp = new THREE.Color();
    var h = step * 0.75;
    for (var v = 0; v < pos.length; v += 3) {
      var x = pos[v], y = pos[v + 1], z = pos[v + 2];
      var gx = field.at(x + h, y, z) - field.at(x - h, y, z);
      var gy = field.at(x, y + h, z) - field.at(x, y - h, z);
      var gz = field.at(x, y, z + h) - field.at(x, y, z - h);
      var len = Math.hypot(gx, gy, gz) || 1;
      nor[v] = gx / len; nor[v + 1] = gy / len; nor[v + 2] = gz / len;
      if (paint) paint(x, y, z, tmp); else tmp.copy(SKIN);
      col[v] = tmp.r; col[v + 1] = tmp.g; col[v + 2] = tmp.b;
    }
    return { position: pos, normal: nor, color: col, index: m.index };
  }

  function toGeometry(a) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(a.position, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(a.normal, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(a.color, 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(a.index), 1));
    return geo;
  }

  function combine(a, b) {
    var pos = new Float32Array(a.position.length + b.position.length);
    pos.set(a.position); pos.set(b.position, a.position.length);
    var nor = new Float32Array(pos.length);
    nor.set(a.normal); nor.set(b.normal, a.normal.length);
    var col = new Float32Array(pos.length);
    col.set(a.color); col.set(b.color, a.color.length);
    var idx = new Uint32Array(a.index.length + b.index.length);
    idx.set(a.index);
    var off = a.position.length / 3;
    for (var i = 0; i < b.index.length; i++) idx[a.index.length + i] = b.index[i] + off;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    return geo;
  }

  /* Exposed for debugging: the two fields the skin is polygonised from. */
  HB.skinFields = function (meshes) {
    var bounds = { min: [-0.36, -0.02, -0.23], max: [0.36, 1.81, 0.25] };
    var anatomy = meshes && meshes.length
      ? new AnatomyField(meshes, bounds, 0.008, 5, 1.545) : null;
    return {
      body: new Field(bodyParts(), bounds, anatomy, 0.009),
      head: new Field(headParts(), { min: [-0.15, 1.30, -0.17], max: [0.15, 1.80, 0.18] }, null, 0)
    };
  };

  HB.buildSkin = function (opts) {
    opts = opts || {};
    var t0 = performance.now();
    var step = opts.step || 0.0064;
    var bounds = { min: [-0.36, -0.02, -0.23], max: [0.36, 1.81, 0.25] };
    var anatomy = opts.meshes && opts.meshes.length
      ? new AnatomyField(opts.meshes, bounds, opts.anatomyStep || 0.008, 5, 1.545)
      : null;

    var headBounds = { min: [-0.15, 1.30, -0.17], max: [0.15, 1.80, 0.18] };
    var body = opts.headOnly ? null
      : polygonise(new Field(bodyParts(), bounds, anatomy, opts.offset),
                   bounds, step, { passes: 6, weight: 0.62 });
    var head = opts.bodyOnly ? null
      : polygonise(new Field(headParts(), headBounds, null, 0),
                   headBounds, opts.headStep || 0.0030, { passes: 1, weight: 0.40 }, paintHead);

    var parts = [body, head].filter(Boolean).map(toGeometry);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: true,
      roughness: 0.62, metalness: 0.0,
      transparent: true, opacity: 1, depthWrite: true,
      side: THREE.FrontSide
    });
    var group = new THREE.Group();
    group.name = 'skin';
    var tris = 0;
    parts.forEach(function (g, i) {
      var mesh = new THREE.Mesh(g, mat);
      mesh.name = i === 0 && parts.length > 1 ? 'skinBody' : (parts.length > 1 ? 'skinHead' : 'skinSurface');
      tris += g.index.count / 3;
      group.add(mesh);
    });
    group.userData.buildMs = Math.round(performance.now() - t0);
    group.userData.tris = tris;
    return group;
  };

})(window);
