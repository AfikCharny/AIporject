/*
 * muscles.js — the muscle atlas.
 *
 * Every entry describes one muscle: where it sits in the layered anatomy,
 * what it does, and how to generate its geometry from the landmark table.
 *
 *   side  'pair' builds the right side and mirrors it for the left,
 *         'mid'  builds a single midline structure.
 *   layer 1 superficial, 2 intermediate, 3 deep.
 *
 * build(c) receives { G, p, mix, L, color, tendon } and returns a
 * BufferGeometry positioned in world space on the RIGHT side of the body.
 */
(function (global) {
  'use strict';
  var HB = (global.HB = global.HB || {});
  var list = [];
  function M(def) { list.push(def); return def; }

  /* =================================================== HEAD AND NECK ==== */

  M({
    id: 'sternocleidomastoid', name: 'Sternocleidomastoid',
    latin: 'M. sternocleidomastoideus', group: 'Head & Neck', layer: 1, side: 'pair',
    origin: 'Manubrium of the sternum and medial third of the clavicle',
    insertion: 'Mastoid process and superior nuchal line',
    action: 'Rotates the head to the opposite side and flexes the neck; assists in forced inspiration',
    nerve: 'Accessory nerve (CN XI), C2–C3',
    build: function (c) {
      var G = c.G, p = c.p;
      var sternal = G.belly([p('sternalNotch', 0.016, 0.004, 0.012), [0.048, 1.492, 0.010], p('mastoid', 0.002, -0.004, 0.004)], {
        r: 0.016, w: 1.25, h: 0.85, endA: 0.35, endB: 0.45, bulge: 1.0, peak: 0.45,
        seg: 26, rad: 12, up: [0.3, 0, 1], color: c.color, tendon: c.tendon
      });
      var clav = G.belly([p('clavMid', -0.028, 0.004, 0.006), [0.062, 1.488, 0.000], p('mastoid', 0.000, -0.010, -0.004)], {
        r: 0.012, w: 1.2, h: 0.8, endA: 0.45, endB: 0.5, bulge: 0.9,
        seg: 22, rad: 10, up: [0.4, 0, 0.9], color: c.color, tendon: c.tendon
      });
      return G.merge([sternal, clav]);
    }
  });

  M({
    id: 'platysma', name: 'Platysma', latin: 'Platysma',
    group: 'Head & Neck', layer: 1, side: 'pair', defaultHidden: true,
    origin: 'Fascia over the pectoralis major and deltoid',
    insertion: 'Mandible and skin of the lower face',
    action: 'Tenses the skin of the neck and draws the corners of the mouth down',
    nerve: 'Cervical branch of the facial nerve (CN VII)',
    build: function (c) {
      return c.G.fan(
        [c.p('clavMed', 0.010, 0.008, 0.016), c.p('clavMid', -0.010, 0.006, 0.010), c.p('clavMid', 0.030, 0.004, -0.004)],
        [c.p('chin', 0.028, 0.004, -0.006), c.p('jawAngle', -0.016, 0.004, 0.012), c.p('jawAngle', 0.002, 0.006, -0.004)],
        { strands: 6, r: 0.008, w: 2.4, h: 0.22, endA: 0.75, endB: 0.75, bulge: 0.5,
          archOut: 0.012, color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'masseter', name: 'Masseter', latin: 'M. masseter',
    group: 'Head & Neck', layer: 1, side: 'pair',
    origin: 'Zygomatic arch',
    insertion: 'Angle and ramus of the mandible',
    action: 'Elevates the mandible — the principal muscle of chewing',
    nerve: 'Mandibular nerve (CN V3)',
    build: function (c) {
      return c.G.belly([c.p('zygomatic', 0.004, -0.004, -0.010), c.p('ramus', 0.010, -0.014, 0.004), c.p('jawAngle', 0.004, 0.002, 0.000)], {
        r: 0.016, w: 1.15, h: 0.75, endA: 0.55, endB: 0.6, bulge: 0.8,
        seg: 18, rad: 11, up: [1, 0, 0.2], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'temporalis', name: 'Temporalis', latin: 'M. temporalis',
    group: 'Head & Neck', layer: 2, side: 'pair',
    origin: 'Temporal fossa of the skull',
    insertion: 'Coronoid process of the mandible',
    action: 'Elevates and retracts the mandible',
    nerve: 'Mandibular nerve (CN V3)',
    build: function (c) {
      return c.G.fan(
        [c.p('temple', 0.006, 0.030, 0.028), c.p('temple', 0.014, 0.024, -0.010), c.p('temple', 0.008, -0.004, -0.044)],
        [c.p('ramus', -0.002, 0.008, 0.004)],
        { strands: 6, r: 0.011, w: 1.5, h: 0.5, endA: 0.7, endB: 0.35, bulge: 0.7,
          archOut: 0.006, color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'splenius_capitis', name: 'Splenius capitis', latin: 'M. splenius capitis',
    group: 'Head & Neck', layer: 2, side: 'pair',
    origin: 'Ligamentum nuchae and spinous processes of C7–T3',
    insertion: 'Mastoid process and lateral superior nuchal line',
    action: 'Extends and rotates the head to the same side',
    nerve: 'Posterior rami of the middle cervical nerves',
    build: function (c) {
      return c.G.fan(
        [c.p('t3', 0.008, 0.010, 0.004), c.p('c7', 0.008, 0.004, 0.004)],
        [c.p('mastoid', 0.000, 0.004, -0.010), c.p('nuchalLine', 0.008, 0.004, -0.004)],
        { strands: 5, r: 0.011, w: 1.7, h: 0.55, endA: 0.6, endB: 0.55, bulge: 0.7,
          archOut: 0.010, color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'scalenes', name: 'Scalene group', latin: 'Mm. scaleni',
    group: 'Head & Neck', layer: 3, side: 'pair',
    origin: 'Transverse processes of C2–C7',
    insertion: 'First and second ribs',
    action: 'Elevates the upper ribs in inspiration; laterally flexes the neck',
    nerve: 'Anterior rami C3–C8',
    build: function (c) {
      var G = c.G, p = c.p, g = [];
      for (var i = 0; i < 3; i++) {
        g.push(G.belly([p('c4', 0.022 + i * 0.004, 0.012 - i * 0.012, 0.004 - i * 0.012),
                        p('rib1', -0.026 + i * 0.010, -0.002 + 0.004 * i, 0.006 - i * 0.014)], {
          r: 0.0085, w: 1.0, h: 1.0, endA: 0.5, endB: 0.5, bulge: 0.9,
          seg: 14, rad: 8, up: [1, 0, 0], color: c.color, tendon: c.tendon
        }));
      }
      return G.merge(g);
    }
  });

  M({
    id: 'infrahyoid', name: 'Infrahyoid group', latin: 'Mm. infrahyoidei',
    group: 'Head & Neck', layer: 2, side: 'pair',
    origin: 'Manubrium, clavicle and scapula',
    insertion: 'Hyoid bone and thyroid cartilage',
    action: 'Depresses the hyoid bone and larynx during swallowing and speech',
    nerve: 'Ansa cervicalis (C1–C3)',
    build: function (c) {
      var G = c.G, p = c.p;
      return G.merge([
        G.belly([p('sternalNotch', 0.012, 0.006, 0.006), [0.018, 1.540, 0.026]], {
          r: 0.008, w: 1.4, h: 0.5, endA: 0.6, endB: 0.6, bulge: 0.7,
          seg: 12, rad: 8, up: [0, 0, 1], color: c.color, tendon: c.tendon }),
        G.belly([p('clavMid', -0.020, 0.006, -0.002), [0.040, 1.512, 0.014], [0.024, 1.542, 0.020]], {
          r: 0.006, w: 1.3, h: 0.5, endA: 0.6, endB: 0.6, bulge: 0.7,
          seg: 14, rad: 8, up: [0, 0, 1], color: c.color, tendon: c.tendon })
      ]);
    }
  });

  /* ========================================================== CHEST ===== */

  M({
    id: 'pectoralis_major', name: 'Pectoralis major', latin: 'M. pectoralis major',
    group: 'Chest', layer: 1, side: 'pair',
    origin: 'Medial clavicle, sternum and costal cartilages 1–6',
    insertion: 'Crest of the greater tubercle of the humerus',
    action: 'Adducts, flexes and medially rotates the arm',
    nerve: 'Lateral and medial pectoral nerves (C5–T1)',
    build: function (c) {
      return c.G.fan(
        [c.p('clavMed', 0.014, 0.000, 0.004), c.p('manubrium', 0.014, -0.004, 0.008),
         c.p('sternumMid', 0.014, 0.000, 0.006), c.p('xiphoid', 0.020, 0.010, 0.004),
         c.p('costalArch', 0.004, 0.006, 0.000)],
        [c.p('humHead', -0.004, -0.028, 0.016), c.p('humHead', 0.000, -0.046, 0.012)],
        { strands: 18, r: 0.026, w: 2.05, h: 0.56, endA: 0.82, endB: 0.24, bulge: 0.85,
          peak: 0.42, archOut: 0.052, color: c.color, tendon: c.tendon,
          rad: 11, map: function (s) { return 1 - s * 0.85; } });
    }
  });

  M({
    id: 'pectoralis_minor', name: 'Pectoralis minor', latin: 'M. pectoralis minor',
    group: 'Chest', layer: 3, side: 'pair',
    origin: 'Ribs 3–5 near their costal cartilages',
    insertion: 'Coracoid process of the scapula',
    action: 'Depresses and protracts the scapula; elevates the ribs in forced inspiration',
    nerve: 'Medial pectoral nerve (C8–T1)',
    build: function (c) {
      return c.G.fan(
        [c.p('rib6', -0.020, 0.058, -0.012), c.p('rib6', -0.010, 0.026, -0.008), c.p('rib6', 0.000, -0.004, -0.010)],
        [c.p('coracoid', -0.002, -0.004, -0.004)],
        { strands: 4, r: 0.011, w: 1.3, h: 0.5, endA: 0.6, endB: 0.35, bulge: 0.8,
          archOut: 0.008, color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'serratus_anterior', name: 'Serratus anterior', latin: 'M. serratus anterior',
    group: 'Chest', layer: 2, side: 'pair',
    origin: 'Outer surfaces of ribs 1–9',
    insertion: 'Medial border of the scapula (costal surface)',
    action: 'Protracts and upwardly rotates the scapula; holds it against the rib cage',
    nerve: 'Long thoracic nerve (C5–C7)',
    build: function (c) {
      var G = c.G, p = c.p, mix = c.mix, g = [];
      for (var i = 0; i < 8; i++) {
        var t = i / 7;
        // each digitation wraps round the side of the rib cage to reach the
        // costal surface of the scapula, rather than cutting through the chest
        var a = [0.104 + 0.020 * Math.sin(t * 2.2), 1.316 - 0.160 * t, 0.034 + 0.014 * t];
        var b = mix('scapSup', 'scapInf', Math.min(1, 0.10 + t * 1.05), -0.026, 0.0, 0.008);
        var wrap = [0.126 + 0.012 * Math.sin(t * 2.0), (a[1] + b[1]) / 2 - 0.004, -0.014];
        g.push(G.belly([a, wrap, b], {
          r: 0.011, w: 1.5, h: 0.45, endA: 0.75, endB: 0.6, bulge: 0.55,
          seg: 16, rad: 8, up: [0.85, 0, 0.5], color: c.color, tendon: c.tendon
        }));
      }
      return G.merge(g);
    }
  });

  M({
    id: 'intercostals', name: 'External intercostals', latin: 'Mm. intercostales externi',
    group: 'Chest', layer: 3, side: 'pair',
    origin: 'Lower border of each rib',
    insertion: 'Upper border of the rib below',
    action: 'Elevate the ribs during inspiration',
    nerve: 'Intercostal nerves (T1–T11)',
    build: function (c) {
      var G = c.G, HB = window.HB, g = [];
      for (var i = 0; i < 9; i++) {
        var a = HB.ribPath(i, 1), b = HB.ribPath(i + 1, 1);
        for (var k = 0; k < 3; k++) {
          var s0 = 0.22 + k * 0.24, s1 = s0 + 0.24;
          g.push(G.belly([G.polyPoint(a, s0), G.polyPoint(a, (s0 + s1) / 2), G.polyPoint(b, s1)], {
            r: 0.009, w: 0.5, h: 1.4, endA: 0.85, endB: 0.85, bulge: 0.3,
            seg: 10, rad: 6, up: [0, 1, 0], color: c.color, tendon: c.tendon
          }));
        }
      }
      return G.merge(g);
    }
  });

  M({
    id: 'diaphragm', name: 'Diaphragm', latin: 'Diaphragma',
    group: 'Chest', layer: 3, side: 'mid',
    origin: 'Xiphoid process, costal margin and lumbar vertebrae',
    insertion: 'Central tendon of the diaphragm',
    action: 'The primary muscle of inspiration — descends to enlarge the thorax',
    nerve: 'Phrenic nerve (C3–C5)',
    build: function (c) {
      var G = c.G, g = [], n = 16;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        var r = 0.118 - 0.020 * Math.cos(a);
        var rim = [Math.cos(a) * r, 1.212 - 0.026 * Math.cos(a), Math.sin(a) * r * 0.72 - 0.010];
        var apex = [0, 1.292, -0.012];
        g.push(G.belly([rim, [rim[0] * 0.55, 1.282, rim[2] * 0.55 - 0.004], apex], {
          r: 0.014, w: 1.6, h: 0.45, endA: 0.8, endB: 0.30, bulge: 0.5,
          seg: 14, rad: 7, up: [rim[0], 0.15, rim[2]], color: c.color, tendon: c.tendon
        }));
      }
      return G.merge(g);
    }
  });

  /* ======================================================== ABDOMEN ===== */

  M({
    id: 'rectus_abdominis', name: 'Rectus abdominis', latin: 'M. rectus abdominis',
    group: 'Abdomen', layer: 1, side: 'pair',
    origin: 'Pubic crest and pubic symphysis',
    insertion: 'Xiphoid process and costal cartilages 5–7',
    action: 'Flexes the trunk and compresses the abdominal contents',
    nerve: 'Thoracoabdominal nerves (T7–T12)',
    build: function (c) {
      // one continuous column per side, swelling into four bellies separated by
      // the tendinous intersections that give the "six pack" its segments
      var G = c.G, mix = c.mix;
      var bot = [0.030, 0.930, 0.056], top = [0.044, 1.242, 0.070];
      return G.belly([bot, mix(bot, top, 0.35, 0, 0, 0.012), mix(bot, top, 0.7, 0, 0, 0.014), top], {
        r: 0.034, w: 1.25, h: 0.58, endA: 0.62, endB: 0.66, bulge: 0.35, peak: 0.6,
        seg: 72, rad: 14, up: [0, 0, 1], color: c.color, tendon: c.tendon,
        fascicles: 3,
        rFn: function (t) {
          var seg = Math.min(0.999, Math.max(0, (t - 0.06) / 0.86)) * 4;
          return 0.80 + 0.20 * Math.pow(Math.sin(Math.PI * (seg % 1)), 0.55);
        }
      });
    }
  });

  M({
    id: 'external_oblique', name: 'External oblique', latin: 'M. obliquus externus abdominis',
    group: 'Abdomen', layer: 1, side: 'pair',
    origin: 'Outer surfaces of ribs 5–12',
    insertion: 'Iliac crest, inguinal ligament and linea alba',
    action: 'Compresses the abdomen; rotates the trunk to the opposite side',
    nerve: 'Thoracoabdominal nerves (T7–T12) and iliohypogastric nerve',
    build: function (c) {
      return c.G.fan(
        [c.p('rib6', -0.010, 0.010, -0.016), c.p('rib10', 0.006, 0.030, -0.030), c.p('ribLow', 0.010, 0.000, -0.026)],
        [c.p('asis', -0.048, -0.010, 0.002), c.p('asis', -0.004, 0.004, -0.004), c.p('iliacLat', 0.000, 0.004, -0.006)],
        { strands: 11, r: 0.018, w: 1.9, h: 0.40, endA: 0.78, endB: 0.66, bulge: 0.5,
          archOut: 0.034, color: c.color, tendon: c.tendon, rad: 9 });
    }
  });

  M({
    id: 'internal_oblique', name: 'Internal oblique', latin: 'M. obliquus internus abdominis',
    group: 'Abdomen', layer: 2, side: 'pair',
    origin: 'Iliac crest, inguinal ligament and thoracolumbar fascia',
    insertion: 'Ribs 10–12, linea alba and pubic crest',
    action: 'Compresses the abdomen; rotates the trunk to the same side',
    nerve: 'Thoracoabdominal nerves (T7–T12), iliohypogastric and ilioinguinal nerves',
    build: function (c) {
      return c.G.fan(
        [c.p('iliacLat', -0.006, -0.002, -0.016), c.p('asis', -0.018, -0.004, -0.006), c.p('asis', -0.058, -0.012, 0.000)],
        [c.p('ribLow', -0.006, 0.026, -0.010), c.p('rib10', -0.018, 0.020, 0.010), c.p('costalArch', -0.038, -0.052, 0.006)],
        { strands: 9, r: 0.015, w: 1.7, h: 0.32, endA: 0.78, endB: 0.7, bulge: 0.45,
          archOut: 0.006, color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'transversus_abdominis', name: 'Transversus abdominis', latin: 'M. transversus abdominis',
    group: 'Abdomen', layer: 3, side: 'pair',
    origin: 'Inner surfaces of costal cartilages 7–12, thoracolumbar fascia and iliac crest',
    insertion: 'Linea alba and pubic crest',
    action: 'Compresses the abdominal contents — the deepest abdominal wall muscle',
    nerve: 'Thoracoabdominal nerves (T7–T12)',
    build: function (c) {
      var G = c.G, g = [];
      for (var i = 0; i < 6; i++) {
        var t = i / 5;
        var y = 1.190 - 0.210 * t;
        g.push(G.belly([[0.022, y, -0.042], [0.082, y + 0.004, -0.010], [0.072, y, 0.030], [0.018, y, 0.040]], {
          r: 0.013, w: 0.45, h: 1.5, endA: 0.85, endB: 0.85, bulge: 0.25,
          seg: 18, rad: 7, up: [0, 1, 0], color: c.color, tendon: c.tendon
        }));
      }
      return G.merge(g);
    }
  });

  HB.MUSCLES = list;
})(window);
