/*
 * landmarks.js — the skeletal reference points every muscle is attached to.
 *
 * Coordinate system: metres, +X is the model's RIGHT, +Y is up (floor at 0),
 * +Z is anterior (towards the viewer in the default front view).
 * The figure is 1.80 m tall and stands in anatomical position.
 *
 * Only the right side is defined. Left-side muscles are built by mirroring
 * the finished geometry, so every attachment stays perfectly symmetric.
 */
(function (global) {
  'use strict';
  var HB = (global.HB = global.HB || {});

  var L = {
    /* ------------------------------------------------------------- head */
    skull:        [0.000, 1.672, 0.004],
    skullTop:     [0.000, 1.770, 0.004],
    occiput:      [0.000, 1.640, -0.082],
    nuchalLine:   [0.030, 1.600, -0.078],
    temple:       [0.066, 1.700, 0.010],
    zygomatic:    [0.058, 1.640, 0.046],
    mastoid:      [0.052, 1.588, -0.040],
    jawAngle:     [0.063, 1.578, -0.004],
    chin:         [0.000, 1.566, 0.070],
    ramus:        [0.060, 1.620, 0.006],

    /* ------------------------------------------------ cervical / thorax */
    c1:           [0.000, 1.562, -0.048],
    c4:           [0.000, 1.508, -0.054],
    c7:           [0.000, 1.452, -0.062],
    t1:           [0.000, 1.432, -0.064],
    t3:           [0.000, 1.380, -0.068],
    t7:           [0.000, 1.288, -0.072],
    t12:          [0.000, 1.180, -0.060],
    l3:           [0.000, 1.098, -0.046],
    l5:           [0.000, 1.038, -0.052],

    sternalNotch: [0.000, 1.424, 0.062],
    manubrium:    [0.000, 1.390, 0.072],
    sternumMid:   [0.000, 1.320, 0.086],
    xiphoid:      [0.000, 1.236, 0.082],

    clavMed:      [0.024, 1.430, 0.058],
    clavMid:      [0.100, 1.444, 0.030],
    acromion:     [0.186, 1.436, -0.014],
    coracoid:     [0.112, 1.400, 0.040],

    rib1:         [0.082, 1.402, 0.030],
    ribLat:       [0.134, 1.286, 0.005],
    rib6:         [0.126, 1.246, 0.060],
    rib10:        [0.118, 1.170, 0.046],
    ribLow:       [0.104, 1.144, -0.024],
    costalArch:   [0.086, 1.206, 0.072],

    /* ------------------------------------------------------- scapula */
    scapSup:      [0.104, 1.404, -0.078],
    scapSpineMed: [0.054, 1.388, -0.086],
    scapSpineLat: [0.166, 1.404, -0.062],
    scapMed:      [0.052, 1.318, -0.090],
    scapInf:      [0.088, 1.240, -0.082],
    scapLat:      [0.144, 1.300, -0.066],
    infraFossa:   [0.100, 1.320, -0.086],

    /* ------------------------------------------------- arm (right side) */
    glenoid:      [0.172, 1.398, -0.012],
    humHead:      [0.178, 1.400, -0.008],
    deltTub:      [0.200, 1.252, 0.008],
    humMid:       [0.200, 1.250, -0.004],
    humLat:       [0.220, 1.128, -0.004],
    humMed:       [0.198, 1.122, -0.004],
    elbow:        [0.214, 1.098, -0.006],
    olecranon:    [0.214, 1.096, -0.038],
    radHead:      [0.228, 1.076, 0.006],
    ulnaProx:     [0.206, 1.076, -0.014],
    foreMid:      [0.246, 0.964, 0.006],
    radMid:       [0.256, 0.966, 0.012],
    ulnaMid:      [0.234, 0.962, -0.012],
    wrist:        [0.262, 0.852, 0.010],
    radStyloid:   [0.274, 0.850, 0.016],
    ulnaStyloid:  [0.248, 0.848, -0.004],
    palm:         [0.268, 0.790, 0.016],
    hand:         [0.272, 0.732, 0.020],
    fingers:      [0.274, 0.690, 0.022],

    /* ---------------------------------------------------------- pelvis */
    sacrum:       [0.000, 1.000, -0.074],
    coccyx:       [0.000, 0.932, -0.064],
    psis:         [0.038, 1.026, -0.070],
    iliacPost:    [0.092, 1.050, -0.062],
    iliacLat:     [0.138, 1.044, -0.004],
    asis:         [0.120, 1.024, 0.062],
    pubis:        [0.028, 0.922, 0.050],
    pubicRamus:   [0.060, 0.906, 0.024],
    ischium:      [0.070, 0.892, -0.062],
    acetabulum:   [0.098, 0.948, 0.004],
    greaterTroch: [0.132, 0.958, -0.010],
    lesserTroch:  [0.086, 0.918, -0.004],

    /* ------------------------------------------------- leg (right side) */
    thighUp:      [0.112, 0.840, 0.010],
    femurMid:     [0.106, 0.720, 0.006],
    femurLat:     [0.116, 0.700, -0.004],
    femurMed:     [0.086, 0.700, -0.002],
    femurLow:     [0.098, 0.560, -0.004],
    knee:         [0.094, 0.492, 0.004],
    patella:      [0.094, 0.496, 0.048],
    condyleLat:   [0.118, 0.486, -0.008],
    condyleMed:   [0.070, 0.486, -0.008],
    tibPlateau:   [0.094, 0.470, 0.002],
    tibTub:       [0.094, 0.446, 0.046],
    tibMed:       [0.076, 0.400, 0.020],
    fibHead:      [0.118, 0.466, -0.008],
    calf:         [0.096, 0.352, -0.034],
    shinMid:      [0.092, 0.300, 0.020],
    fibMid:       [0.114, 0.300, -0.006],
    tibLow:       [0.088, 0.130, 0.008],
    ankle:        [0.086, 0.086, -0.012],
    malleolusLat: [0.110, 0.092, -0.020],
    malleolusMed: [0.066, 0.098, -0.010],
    calcaneus:    [0.088, 0.044, -0.064],
    midfoot:      [0.088, 0.036, 0.020],
    footFront:    [0.090, 0.024, 0.086],
    toes:         [0.090, 0.018, 0.112]
  };

  /* p('knee', dx, dy, dz) -> offset copy of a landmark */
  function p(name, dx, dy, dz) {
    var a = L[name];
    if (!a) throw new Error('unknown landmark: ' + name);
    return [a[0] + (dx || 0), a[1] + (dy || 0), a[2] + (dz || 0)];
  }

  /* mix('knee','ankle',0.4) -> point along the line between two landmarks */
  function mix(a, b, t, dx, dy, dz) {
    var A = typeof a === 'string' ? L[a] : a;
    var B = typeof b === 'string' ? L[b] : b;
    return [
      A[0] + (B[0] - A[0]) * t + (dx || 0),
      A[1] + (B[1] - A[1]) * t + (dy || 0),
      A[2] + (B[2] - A[2]) * t + (dz || 0)
    ];
  }

  /* ribPath(i) — control points for rib pair i (0 = first rib, 10 = eleventh),
     shared by the skeleton and by the intercostal muscles so they interleave. */
  function ribPath(i, inset) {
    var n = 10, t = i / n;
    var k = inset || 0;
    var y = 1.398 - 0.0232 * i;
    var half = (0.060 + 0.070 * Math.sin(Math.PI * (0.32 + 0.60 * t))) * (1 - k * 0.09);
    var zBack = -0.050 - 0.012 * Math.sin(Math.PI * t) + k * 0.012;
    var zFront = (0.062 - 0.026 * Math.max(0, t - 0.55)) * (1 - k * 0.14);
    var floating = t > 0.78;
    var end = floating
      ? [half * 0.66, y - 0.052, 0.030]
      : [0.026 + 0.046 * t, 1.412 - 0.176 * t - 0.028, zFront];
    return [
      [0.018, y + 0.004, zBack],
      [half * 0.86, y - 0.010, zBack * 0.45],
      [half * (1 - k * 0.05), y - 0.026, 0.016 * (1 - k)],
      end
    ];
  }

  HB.ribPath = ribPath;
  HB.L = L;
  HB.p = p;
  HB.mix = mix;
})(window);
