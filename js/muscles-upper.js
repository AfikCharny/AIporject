/*
 * muscles-upper.js — back, shoulder, arm and forearm.
 */
(function (global) {
  'use strict';
  var HB = global.HB;
  function M(def) { HB.MUSCLES.push(def); return def; }

  /* =========================================================== BACK ===== */

  M({
    id: 'trapezius', name: 'Trapezius', latin: 'M. trapezius',
    group: 'Back', layer: 1, side: 'pair',
    origin: 'External occipital protuberance, ligamentum nuchae and spinous processes of C7–T12',
    insertion: 'Lateral clavicle, acromion and spine of the scapula',
    action: 'Elevates, retracts and rotates the scapula; extends the head',
    nerve: 'Accessory nerve (CN XI), C3–C4',
    build: function (c) {
      return c.G.fan(
        [c.p('occiput', 0.010, 0.004, 0.006), c.p('c7', 0.008, 0.016, 0.006),
         c.p('t3', 0.008, 0.006, 0.006), c.p('t7', 0.008, 0.000, 0.004), c.p('t12', 0.008, 0.000, 0.004)],
        [c.p('clavMid', 0.022, 0.000, 0.000), c.p('acromion', -0.006, -0.004, -0.010),
         c.p('scapSpineLat', -0.008, -0.004, -0.004), c.p('scapSpineMed', 0.004, -0.004, -0.004)],
        { strands: 16, r: 0.020, w: 2.2, h: 0.40, endA: 0.86, endB: 0.62, bulge: 0.55,
          archOut: 0.038, color: c.color, tendon: c.tendon, rad: 9,
          rFnStrand: function (s) { return 0.42 + 0.80 * Math.min(1, s * 1.9); },
          map: function (s) { return Math.pow(s, 0.82); } });
    }
  });

  M({
    id: 'latissimus_dorsi', name: 'Latissimus dorsi', latin: 'M. latissimus dorsi',
    group: 'Back', layer: 1, side: 'pair',
    origin: 'Spinous processes of T7–L5, thoracolumbar fascia, iliac crest and ribs 9–12',
    insertion: 'Floor of the intertubercular groove of the humerus',
    action: 'Extends, adducts and medially rotates the arm — the climbing and rowing muscle',
    nerve: 'Thoracodorsal nerve (C6–C8)',
    build: function (c) {
      return c.G.fan(
        [c.p('t7', 0.010, 0.010, 0.004), c.p('t12', 0.010, 0.004, 0.004),
         c.p('l3', 0.012, 0.000, 0.004), c.p('iliacPost', -0.014, 0.004, -0.004), c.p('iliacLat', -0.006, 0.000, -0.010)],
        [c.p('humHead', -0.010, -0.034, 0.006), c.p('humHead', -0.006, -0.058, 0.000)],
        { strands: 16, r: 0.021, w: 2.3, h: 0.36, endA: 0.88, endB: 0.22, bulge: 0.7,
          archOut: 0.042, color: c.color, tendon: c.tendon, rad: 9,
          map: function (s) { return 1 - s * 0.9; } });
    }
  });

  M({
    id: 'rhomboids', name: 'Rhomboid major & minor', latin: 'Mm. rhomboidei',
    group: 'Back', layer: 2, side: 'pair',
    origin: 'Spinous processes of C7–T5',
    insertion: 'Medial border of the scapula',
    action: 'Retracts and downwardly rotates the scapula',
    nerve: 'Dorsal scapular nerve (C4–C5)',
    build: function (c) {
      return c.G.fan(
        [c.p('c7', 0.010, 0.000, 0.002), c.p('t3', 0.010, 0.006, 0.002), c.p('t3', 0.010, -0.048, 0.002)],
        [c.p('scapSup', -0.038, -0.006, 0.008), c.p('scapMed', -0.002, 0.010, 0.006), c.p('scapInf', -0.024, 0.008, 0.006)],
        { strands: 8, r: 0.015, w: 1.8, h: 0.38, endA: 0.8, endB: 0.7, bulge: 0.5,
          archOut: 0.022, color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'levator_scapulae', name: 'Levator scapulae', latin: 'M. levator scapulae',
    group: 'Back', layer: 2, side: 'pair',
    origin: 'Transverse processes of C1–C4',
    insertion: 'Superior angle of the scapula',
    action: 'Elevates the scapula and tilts the glenoid cavity downward',
    nerve: 'Dorsal scapular nerve and C3–C4',
    build: function (c) {
      return c.G.belly([c.p('c1', 0.020, 0.004, -0.004), c.p('c7', 0.038, 0.030, -0.010), c.p('scapSup', -0.006, 0.004, 0.004)], {
        r: 0.011, w: 1.3, h: 0.6, endA: 0.5, endB: 0.5, bulge: 0.8,
        seg: 20, rad: 9, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'erector_spinae', name: 'Erector spinae', latin: 'M. erector spinae',
    group: 'Back', layer: 3, side: 'pair',
    origin: 'Sacrum, iliac crest and lumbar spinous processes',
    insertion: 'Ribs, transverse processes and the mastoid process',
    action: 'Extends and laterally flexes the vertebral column; controls forward bending',
    nerve: 'Posterior rami of the spinal nerves',
    build: function (c) {
      var G = c.G, p = c.p, g = [];
      // longissimus
      g.push(G.belly([p('sacrum', 0.018, -0.004, 0.008), p('l3', 0.026, 0.000, 0.006),
                      p('t12', 0.028, 0.000, 0.004), p('t7', 0.026, 0.000, 0.002),
                      p('t3', 0.022, 0.000, 0.002), p('c4', 0.020, -0.010, 0.000)], {
        r: 0.019, w: 1.2, h: 0.85, endA: 0.55, endB: 0.35, bulge: 0.6, peak: 0.35,
        seg: 44, rad: 11, up: [0, 0, -1], color: c.color, tendon: c.tendon
      }));
      // iliocostalis
      g.push(G.belly([p('iliacPost', -0.026, -0.010, 0.010), p('l3', 0.046, 0.024, 0.004),
                      p('t12', 0.052, 0.010, -0.002), p('t7', 0.058, 0.000, -0.004), p('t3', 0.046, 0.010, -0.004)], {
        r: 0.015, w: 1.3, h: 0.7, endA: 0.55, endB: 0.4, bulge: 0.6, peak: 0.35,
        seg: 36, rad: 10, up: [0, 0, -1], color: c.color, tendon: c.tendon
      }));
      return G.merge(g);
    }
  });

  M({
    id: 'quadratus_lumborum', name: 'Quadratus lumborum', latin: 'M. quadratus lumborum',
    group: 'Back', layer: 3, side: 'pair',
    origin: 'Iliac crest and iliolumbar ligament',
    insertion: 'Twelfth rib and transverse processes of L1–L4',
    action: 'Laterally flexes the trunk and fixes the twelfth rib during respiration',
    nerve: 'Anterior rami T12–L4',
    build: function (c) {
      return c.G.fan(
        [c.p('iliacPost', -0.014, -0.004, 0.006), c.p('iliacLat', -0.026, -0.004, -0.006)],
        [c.p('t12', 0.026, 0.004, 0.006), c.p('ribLow', -0.014, 0.014, -0.012)],
        { strands: 4, r: 0.013, w: 1.3, h: 0.5, endA: 0.7, endB: 0.65, bulge: 0.5,
          color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  /* ======================================================= SHOULDER ===== */

  M({
    id: 'deltoid', name: 'Deltoid', latin: 'M. deltoideus',
    group: 'Shoulder', layer: 1, side: 'pair',
    origin: 'Lateral third of the clavicle, acromion and spine of the scapula',
    insertion: 'Deltoid tuberosity of the humerus',
    action: 'Abducts the arm; the front fibres flex it, the rear fibres extend it',
    nerve: 'Axillary nerve (C5–C6)',
    build: function (c) {
      return c.G.fan(
        [c.p('clavMid', 0.034, -0.004, 0.012), c.p('acromion', -0.006, 0.000, 0.014),
         c.p('acromion', 0.006, 0.000, -0.006), c.p('scapSpineLat', 0.006, -0.006, -0.016)],
        [c.p('deltTub', 0.000, 0.010, 0.000)],
        { strands: 14, r: 0.022, w: 1.6, h: 0.72, endA: 0.70, endB: 0.22, bulge: 0.95,
          peak: 0.42, archOut: 0.032, color: c.color, tendon: c.tendon, rad: 10 });
    }
  });

  M({
    id: 'supraspinatus', name: 'Supraspinatus', latin: 'M. supraspinatus',
    group: 'Shoulder', layer: 3, side: 'pair',
    origin: 'Supraspinous fossa of the scapula',
    insertion: 'Superior facet of the greater tubercle of the humerus',
    action: 'Initiates abduction of the arm; a rotator cuff muscle',
    nerve: 'Suprascapular nerve (C5–C6)',
    build: function (c) {
      return c.G.belly([c.p('scapSpineMed', 0.020, 0.012, -0.006), c.p('scapSup', 0.030, 0.010, -0.008), c.p('humHead', -0.006, 0.014, -0.010)], {
        r: 0.013, w: 1.4, h: 0.6, endA: 0.55, endB: 0.3, bulge: 0.8,
        seg: 18, rad: 9, up: [0, 1, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'infraspinatus', name: 'Infraspinatus', latin: 'M. infraspinatus',
    group: 'Shoulder', layer: 2, side: 'pair',
    origin: 'Infraspinous fossa of the scapula',
    insertion: 'Middle facet of the greater tubercle of the humerus',
    action: 'Laterally rotates the arm; a rotator cuff muscle',
    nerve: 'Suprascapular nerve (C5–C6)',
    build: function (c) {
      return c.G.fan(
        [c.p('scapSpineMed', 0.008, -0.014, 0.004), c.p('scapMed', 0.006, -0.010, 0.004), c.p('scapInf', 0.002, 0.014, 0.004)],
        [c.p('humHead', -0.004, 0.000, -0.018)],
        { strands: 8, r: 0.015, w: 1.7, h: 0.44, endA: 0.75, endB: 0.3, bulge: 0.7,
          archOut: 0.026, color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'teres_minor', name: 'Teres minor', latin: 'M. teres minor',
    group: 'Shoulder', layer: 2, side: 'pair',
    origin: 'Upper lateral border of the scapula',
    insertion: 'Inferior facet of the greater tubercle of the humerus',
    action: 'Laterally rotates the arm; a rotator cuff muscle',
    nerve: 'Axillary nerve (C5–C6)',
    build: function (c) {
      return c.G.belly([c.p('scapLat', 0.000, -0.020, 0.004), c.p('humHead', -0.010, -0.014, -0.016)], {
        r: 0.010, w: 1.3, h: 0.7, endA: 0.55, endB: 0.4, bulge: 0.8,
        seg: 14, rad: 8, up: [0, 1, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'teres_major', name: 'Teres major', latin: 'M. teres major',
    group: 'Shoulder', layer: 2, side: 'pair',
    origin: 'Inferior angle of the scapula',
    insertion: 'Medial lip of the intertubercular groove of the humerus',
    action: 'Adducts and medially rotates the arm',
    nerve: 'Lower subscapular nerve (C5–C6)',
    build: function (c) {
      return c.G.belly([c.p('scapInf', 0.004, 0.004, 0.000), c.p('humHead', -0.026, -0.040, -0.012), c.p('humHead', -0.012, -0.052, 0.000)], {
        r: 0.013, w: 1.2, h: 0.8, endA: 0.5, endB: 0.35, bulge: 0.9,
        seg: 18, rad: 9, up: [0, 1, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'subscapularis', name: 'Subscapularis', latin: 'M. subscapularis',
    group: 'Shoulder', layer: 3, side: 'pair',
    origin: 'Subscapular fossa (costal surface of the scapula)',
    insertion: 'Lesser tubercle of the humerus',
    action: 'Medially rotates the arm; a rotator cuff muscle',
    nerve: 'Upper and lower subscapular nerves (C5–C6)',
    build: function (c) {
      return c.G.fan(
        [c.p('scapSup', -0.010, -0.010, 0.012), c.p('scapMed', 0.004, 0.000, 0.012), c.p('scapInf', 0.004, 0.016, 0.012)],
        [c.p('humHead', -0.016, -0.004, 0.006)],
        { strands: 5, r: 0.011, w: 1.5, h: 0.4, endA: 0.6, endB: 0.3, bulge: 0.7,
          color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  /* ============================================================ ARM ===== */

  M({
    id: 'biceps_brachii', name: 'Biceps brachii', latin: 'M. biceps brachii',
    group: 'Arm', layer: 1, side: 'pair',
    origin: 'Long head: supraglenoid tubercle. Short head: coracoid process',
    insertion: 'Radial tuberosity and bicipital aponeurosis',
    action: 'Flexes the elbow and supinates the forearm',
    nerve: 'Musculocutaneous nerve (C5–C6)',
    build: function (c) {
      var G = c.G, p = c.p;
      var longHead = G.belly([p('humHead', -0.006, 0.012, 0.008), p('humMid', -0.008, 0.050, 0.024),
                              p('humMid', -0.004, -0.030, 0.026), p('radHead', -0.004, -0.010, 0.002)], {
        r: 0.019, w: 1.0, h: 1.0, endA: 0.24, endB: 0.22, bulge: 1.15, peak: 0.52,
        seg: 28, rad: 12, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      var shortHead = G.belly([p('coracoid', 0.004, -0.004, 0.000), p('humMid', -0.020, 0.040, 0.020),
                               p('humMid', -0.018, -0.030, 0.022), p('radHead', -0.008, -0.012, 0.000)], {
        r: 0.016, w: 1.0, h: 1.0, endA: 0.24, endB: 0.2, bulge: 1.1, peak: 0.52,
        seg: 28, rad: 12, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      return G.merge([longHead, shortHead]);
    }
  });

  M({
    id: 'brachialis', name: 'Brachialis', latin: 'M. brachialis',
    group: 'Arm', layer: 2, side: 'pair',
    origin: 'Distal half of the anterior humerus',
    insertion: 'Coronoid process and tuberosity of the ulna',
    action: 'The workhorse flexor of the elbow, whatever the forearm position',
    nerve: 'Musculocutaneous nerve (C5–C6)',
    build: function (c) {
      return c.G.belly([c.p('humMid', 0.000, -0.020, 0.012), c.p('humLat', -0.004, -0.004, 0.018), c.p('ulnaProx', 0.004, 0.000, 0.008)], {
        r: 0.016, w: 1.25, h: 0.8, endA: 0.55, endB: 0.35, bulge: 0.85,
        seg: 20, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'coracobrachialis', name: 'Coracobrachialis', latin: 'M. coracobrachialis',
    group: 'Arm', layer: 3, side: 'pair',
    origin: 'Coracoid process of the scapula',
    insertion: 'Middle of the medial surface of the humerus',
    action: 'Flexes and adducts the arm',
    nerve: 'Musculocutaneous nerve (C5–C7)',
    build: function (c) {
      return c.G.belly([c.p('coracoid', 0.002, -0.008, -0.004), c.p('humMid', -0.022, 0.030, 0.000), c.p('humMid', -0.014, -0.014, 0.000)], {
        r: 0.010, w: 1.1, h: 0.9, endA: 0.4, endB: 0.4, bulge: 0.9,
        seg: 18, rad: 9, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'triceps_brachii', name: 'Triceps brachii', latin: 'M. triceps brachii',
    group: 'Arm', layer: 1, side: 'pair',
    origin: 'Long head: infraglenoid tubercle. Lateral and medial heads: posterior humerus',
    insertion: 'Olecranon of the ulna',
    action: 'Extends the elbow; the long head also extends and adducts the arm',
    nerve: 'Radial nerve (C6–C8)',
    build: function (c) {
      var G = c.G, p = c.p;
      var longHead = G.belly([p('scapLat', 0.002, -0.036, -0.004), p('humMid', -0.014, 0.040, -0.030),
                              p('humMid', -0.008, -0.040, -0.030), p('olecranon', -0.004, 0.012, -0.006)], {
        r: 0.018, w: 1.05, h: 0.95, endA: 0.3, endB: 0.28, bulge: 1.0, peak: 0.45,
        seg: 28, rad: 12, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      var lateral = G.belly([p('humHead', 0.008, -0.048, -0.020), p('humMid', 0.014, -0.030, -0.028), p('olecranon', 0.004, 0.014, -0.004)], {
        r: 0.016, w: 1.1, h: 0.9, endA: 0.45, endB: 0.3, bulge: 0.9,
        seg: 22, rad: 11, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      var medial = G.belly([p('humMid', -0.014, -0.040, -0.024), p('humMed', -0.008, -0.010, -0.022), p('olecranon', -0.010, 0.010, -0.004)], {
        r: 0.013, w: 1.1, h: 0.9, endA: 0.5, endB: 0.35, bulge: 0.85,
        seg: 18, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      return G.merge([longHead, lateral, medial]);
    }
  });

  M({
    id: 'anconeus', name: 'Anconeus', latin: 'M. anconeus',
    group: 'Arm', layer: 2, side: 'pair',
    origin: 'Lateral epicondyle of the humerus',
    insertion: 'Olecranon and proximal posterior ulna',
    action: 'Assists elbow extension and stabilises the joint',
    nerve: 'Radial nerve (C7–C8)',
    build: function (c) {
      return c.G.belly([c.p('humLat', 0.006, -0.012, -0.018), c.p('ulnaProx', 0.000, -0.030, -0.022)], {
        r: 0.010, w: 1.4, h: 0.6, endA: 0.6, endB: 0.5, bulge: 0.6,
        seg: 12, rad: 8, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  /* ======================================================== FOREARM ===== */

  function fore(id, name, latin, layer, path, opts, info) {
    M(Object.assign({
      id: id, name: name, latin: latin, group: 'Forearm', layer: layer, side: 'pair',
      build: function (c) {
        var o = Object.assign({
          r: 0.011, w: 1.2, h: 0.8, endA: 0.45, endB: 0.16, bulge: 1.0, peak: 0.34,
          seg: 26, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
        }, opts);
        return c.G.belly(path(c.p), o);
      }
    }, info));
  }

  fore('brachioradialis', 'Brachioradialis', 'M. brachioradialis', 1,
    function (p) { return [p('humLat', 0.004, 0.030, 0.004), p('radHead', 0.014, -0.030, 0.014), p('radMid', 0.012, -0.030, 0.008), p('radStyloid', 0.004, 0.004, 0.004)]; },
    { r: 0.014, peak: 0.28, endB: 0.14 },
    { origin: 'Lateral supracondylar ridge of the humerus',
      insertion: 'Styloid process of the radius',
      action: 'Flexes the elbow, strongest with the forearm in mid-pronation',
      nerve: 'Radial nerve (C5–C6)' });

  fore('ext_carpi_radialis', 'Extensor carpi radialis', 'M. extensor carpi radialis longus', 2,
    function (p) { return [p('humLat', 0.006, 0.014, -0.004), p('radMid', 0.014, 0.030, -0.006), p('radStyloid', 0.008, 0.010, -0.002)]; },
    { r: 0.011 },
    { origin: 'Lateral supracondylar ridge and lateral epicondyle',
      insertion: 'Bases of the second and third metacarpals',
      action: 'Extends and abducts the wrist',
      nerve: 'Radial nerve (C6–C7)' });

  fore('extensor_digitorum', 'Extensor digitorum', 'M. extensor digitorum', 1,
    function (p) { return [p('humLat', 0.002, -0.004, -0.016), p('foreMid', 0.008, 0.026, -0.024), p('wrist', 0.004, 0.006, -0.014), p('hand', 0.002, 0.030, -0.006)]; },
    { r: 0.012, endB: 0.12, peak: 0.3 },
    { origin: 'Common extensor tendon on the lateral epicondyle',
      insertion: 'Extensor expansions of the four fingers',
      action: 'Extends the fingers and the wrist',
      nerve: 'Posterior interosseous nerve (C7–C8)' });

  fore('ext_carpi_ulnaris', 'Extensor carpi ulnaris', 'M. extensor carpi ulnaris', 1,
    function (p) { return [p('humLat', -0.004, -0.010, -0.020), p('ulnaMid', 0.006, 0.020, -0.024), p('ulnaStyloid', 0.000, 0.004, -0.012)]; },
    { r: 0.010 },
    { origin: 'Lateral epicondyle and posterior border of the ulna',
      insertion: 'Base of the fifth metacarpal',
      action: 'Extends and adducts the wrist',
      nerve: 'Posterior interosseous nerve (C7–C8)' });

  fore('pronator_teres', 'Pronator teres', 'M. pronator teres', 1,
    function (p) { return [p('humMed', -0.006, -0.004, 0.010), p('radMid', -0.008, 0.052, 0.014)]; },
    { r: 0.011, endA: 0.5, endB: 0.35, peak: 0.45, seg: 16 },
    { origin: 'Medial epicondyle of the humerus and coronoid process of the ulna',
      insertion: 'Lateral surface of the mid-radius',
      action: 'Pronates the forearm and assists elbow flexion',
      nerve: 'Median nerve (C6–C7)' });

  fore('flexor_carpi_radialis', 'Flexor carpi radialis', 'M. flexor carpi radialis', 1,
    function (p) { return [p('humMed', -0.006, -0.010, 0.008), p('foreMid', 0.006, 0.010, 0.020), p('radStyloid', -0.008, 0.002, 0.012)]; },
    { r: 0.010 },
    { origin: 'Medial epicondyle of the humerus',
      insertion: 'Bases of the second and third metacarpals',
      action: 'Flexes and abducts the wrist',
      nerve: 'Median nerve (C6–C7)' });

  fore('palmaris_longus', 'Palmaris longus', 'M. palmaris longus', 1,
    function (p) { return [p('humMed', -0.002, -0.012, 0.004), p('foreMid', -0.004, 0.006, 0.020), p('palm', -0.004, 0.036, 0.012)]; },
    { r: 0.0075, endB: 0.12, peak: 0.28 },
    { origin: 'Medial epicondyle of the humerus',
      insertion: 'Palmar aponeurosis',
      action: 'Tenses the palmar aponeurosis and weakly flexes the wrist; absent in about one person in seven',
      nerve: 'Median nerve (C7–C8)' });

  fore('flexor_carpi_ulnaris', 'Flexor carpi ulnaris', 'M. flexor carpi ulnaris', 1,
    function (p) { return [p('humMed', -0.004, -0.014, -0.006), p('ulnaMid', -0.010, 0.020, 0.008), p('ulnaStyloid', -0.006, 0.004, 0.004)]; },
    { r: 0.011 },
    { origin: 'Medial epicondyle and olecranon',
      insertion: 'Pisiform, hamate and fifth metacarpal',
      action: 'Flexes and adducts the wrist',
      nerve: 'Ulnar nerve (C7–T1)' });

  fore('flexor_digitorum_sup', 'Flexor digitorum superficialis', 'M. flexor digitorum superficialis', 2,
    function (p) { return [p('humMed', -0.004, -0.018, 0.000), p('foreMid', -0.006, 0.010, 0.014), p('wrist', -0.004, 0.004, 0.012), p('fingers', -0.002, 0.024, 0.010)]; },
    { r: 0.012, endB: 0.1, peak: 0.3 },
    { origin: 'Medial epicondyle, coronoid process and anterior radius',
      insertion: 'Middle phalanges of the four fingers',
      action: 'Flexes the middle phalanges — the main finger flexor for grip',
      nerve: 'Median nerve (C7–T1)' });

  fore('supinator', 'Supinator', 'M. supinator', 3,
    function (p) { return [p('humLat', 0.000, -0.018, -0.010), p('radHead', 0.006, -0.026, 0.010)]; },
    { r: 0.010, w: 1.4, h: 0.6, endA: 0.6, endB: 0.5, bulge: 0.6, seg: 12 },
    { origin: 'Lateral epicondyle, radial collateral ligament and supinator crest of the ulna',
      insertion: 'Proximal third of the radius',
      action: 'Supinates the forearm',
      nerve: 'Posterior interosseous nerve (C6–C7)' });

})(window);
