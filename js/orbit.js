/*
 * orbit.js — small orbit / pan / zoom camera controller with inertia.
 * Written from scratch so the page depends on nothing but three.js itself.
 */
(function (global) {
  'use strict';
  var THREE = global.THREE;
  var HB = (global.HB = global.HB || {});

  function Orbit(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.target = new THREE.Vector3(0, 0.95, 0);
    this.theta = 0;          // azimuth, radians
    this.phi = Math.PI / 2;  // polar, radians
    this.distance = 3.2;
    this.minDistance = 0.35;
    this.maxDistance = 8;
    this.damping = 0.12;
    this.autoRotate = false;
    this.autoRotateSpeed = 0.28;
    this.enabled = true;

    this._t = { theta: 0, phi: Math.PI / 2, distance: 3.2, target: this.target.clone() };
    this._state = 0; // 0 none, 1 rotate, 2 pan
    this._px = 0; this._py = 0;
    this._pointers = {};
    this._pinch = 0;
    this.moved = false;

    var self = this;
    dom.addEventListener('pointerdown', function (e) { self._down(e); });
    dom.addEventListener('pointermove', function (e) { self._move(e); });
    window.addEventListener('pointerup', function (e) { self._up(e); });
    window.addEventListener('pointercancel', function (e) { self._up(e); });
    dom.addEventListener('wheel', function (e) { self._wheel(e); }, { passive: false });
    dom.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  Orbit.prototype._down = function (e) {
    if (!this.enabled) return;
    this.dom.setPointerCapture && this.dom.setPointerCapture(e.pointerId);
    this._pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var n = Object.keys(this._pointers).length;
    this.moved = false;
    if (n === 1) {
      this._state = (e.button === 2 || e.shiftKey) ? 2 : 1;
      this._px = e.clientX; this._py = e.clientY;
    } else if (n === 2) {
      this._state = 3;
      this._pinch = this._pinchDist();
    }
  };

  Orbit.prototype._pinchDist = function () {
    var k = Object.keys(this._pointers);
    if (k.length < 2) return 0;
    var a = this._pointers[k[0]], b = this._pointers[k[1]];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  Orbit.prototype._move = function (e) {
    if (!this._pointers[e.pointerId]) return;
    this._pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var dx = e.clientX - this._px, dy = e.clientY - this._py;
    if (Math.abs(dx) + Math.abs(dy) > 3) this.moved = true;
    if (this._state === 1) {
      this._t.theta -= dx * 0.0062;
      this._t.phi = THREE.MathUtils.clamp(this._t.phi - dy * 0.0062, 0.08, Math.PI - 0.08);
    } else if (this._state === 2) {
      this._pan(dx, dy);
    } else if (this._state === 3) {
      var d = this._pinchDist();
      if (this._pinch) this._t.distance = THREE.MathUtils.clamp(
        this._t.distance * (this._pinch / Math.max(d, 1)), this.minDistance, this.maxDistance);
      this._pinch = d;
    }
    this._px = e.clientX; this._py = e.clientY;
  };

  Orbit.prototype._pan = function (dx, dy) {
    var el = this.dom;
    var scale = 2 * this._t.distance * Math.tan((this.camera.fov / 2) * Math.PI / 180) / el.clientHeight;
    var right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0);
    var up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);
    this._t.target.addScaledVector(right, -dx * scale);
    this._t.target.addScaledVector(up, dy * scale);
  };

  Orbit.prototype._up = function (e) {
    delete this._pointers[e.pointerId];
    var n = Object.keys(this._pointers).length;
    this._state = n === 0 ? 0 : (n === 1 ? 1 : 3);
    if (n === 1) {
      var k = Object.keys(this._pointers)[0];
      this._px = this._pointers[k].x; this._py = this._pointers[k].y;
    }
  };

  Orbit.prototype._wheel = function (e) {
    if (!this.enabled) return;
    e.preventDefault();
    var f = Math.pow(0.94, -e.deltaY * (e.deltaMode === 1 ? 0.6 : 0.022));
    this._t.distance = THREE.MathUtils.clamp(this._t.distance / f, this.minDistance, this.maxDistance);
  };

  Orbit.prototype.frame = function (center, radius, azimuth, polar) {
    this._t.target.copy(center);
    this._t.distance = THREE.MathUtils.clamp(
      radius / Math.tan((this.camera.fov / 2) * Math.PI / 180) * 1.35,
      this.minDistance, this.maxDistance);
    if (azimuth != null) this._t.theta = azimuth;
    if (polar != null) this._t.phi = polar;
  };

  Orbit.prototype.setView = function (azimuth, polar, target, distance) {
    this._t.theta = azimuth;
    this._t.phi = polar;
    if (target) this._t.target.copy(target);
    if (distance) this._t.distance = distance;
  };

  Orbit.prototype.update = function (dt) {
    if (this.autoRotate && this._state === 0) this._t.theta += this.autoRotateSpeed * dt;
    var k = 1 - Math.pow(1 - this.damping, Math.max(dt, 0.0001) * 60);
    this.theta += (this._t.theta - this.theta) * k;
    this.phi += (this._t.phi - this.phi) * k;
    this.distance += (this._t.distance - this.distance) * k;
    this.target.lerp(this._t.target, k);

    var sp = Math.sin(this.phi), cp = Math.cos(this.phi);
    this.camera.position.set(
      this.target.x + this.distance * sp * Math.sin(this.theta),
      this.target.y + this.distance * cp,
      this.target.z + this.distance * sp * Math.cos(this.theta)
    );
    this.camera.lookAt(this.target);
  };

  HB.Orbit = Orbit;
})(window);
