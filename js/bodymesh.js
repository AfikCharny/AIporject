/*
 * bodymesh.js — load the supplied base mesh as the figure's skin.
 *
 * assets/body-mesh.js is produced by tools/prepare-mesh.js from the uploaded
 * OBJ. It sets HB.BODY_MESH_B64: base64 of "HBM1", uint32 vertex count, uint32
 * index count, then positions and normals as float32 and indices as uint32,
 * already normalised to a 1.80 m figure standing at y = 0. Shipping it as a
 * script rather than a binary keeps the page working when opened from disk.
 */
(function (global) {
  'use strict';
  var THREE = global.THREE;
  var HB = (global.HB = global.HB || {});

  function parse(buffer) {
    var head = new DataView(buffer, 0, 12);
    var magic = String.fromCharCode(head.getUint8(0), head.getUint8(1),
                                    head.getUint8(2), head.getUint8(3));
    if (magic !== 'HBM1') throw new Error('body.bin: unexpected format "' + magic + '"');
    var nv = head.getUint32(4, true), ni = head.getUint32(8, true);
    var off = 12;
    var pos = new Float32Array(buffer, off, nv * 3); off += nv * 12;
    var nor = new Float32Array(buffer, off, nv * 3); off += nv * 12;
    var idx = new Uint32Array(buffer, off, ni);

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    return geo;
  }

  function decode(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  HB.loadBody = function (url, onDone, onError) {
    var t0 = performance.now();
    function build(buffer) {
      var geo = parse(buffer);
      var mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xcf9b7d).convertSRGBToLinear(),
        roughness: 0.66, metalness: 0.0,
        transparent: true, opacity: 1, depthWrite: true, side: THREE.FrontSide
      });
      var group = new THREE.Group();
      group.name = 'skin';
      var mesh = new THREE.Mesh(geo, mat);
      mesh.name = 'skinSurface';
      group.add(mesh);
      group.userData.tris = geo.index.count / 3;
      group.userData.verts = geo.attributes.position.count;
      group.userData.buildMs = Math.round(performance.now() - t0);
      onDone(group);
    }
    try {
      if (!HB.BODY_MESH_B64) throw new Error('assets/body-mesh.js did not load');
      build(decode(HB.BODY_MESH_B64));
    } catch (err) {
      if (onError) onError(err); else throw err;
    }
  };
})(window);
