/*
 * muscles-lower.js — hip, thigh and leg.
 */
(function (global) {
  'use strict';
  var HB = global.HB;
  function M(def) { HB.MUSCLES.push(def); return def; }

  /* ============================================================ HIP ===== */

  M({
    id: 'gluteus_maximus', name: 'Gluteus maximus', latin: 'M. gluteus maximus',
    group: 'Hip', layer: 1, side: 'pair',
    origin: 'Posterior ilium, sacrum, coccyx and sacrotuberous ligament',
    insertion: 'Iliotibial tract and gluteal tuberosity of the femur',
    action: 'Extends and laterally rotates the hip — powers standing up, stairs and sprinting',
    nerve: 'Inferior gluteal nerve (L5–S2)',
    build: function (c) {
      return c.G.fan(
        [c.p('iliacPost', -0.010, 0.000, -0.008), c.p('sacrum', 0.016, -0.010, 0.000), c.p('coccyx', 0.014, -0.004, 0.004)],
        [c.p('greaterTroch', 0.006, -0.010, -0.014), c.p('femurLat', 0.004, 0.050, -0.020), c.p('femurMid', -0.008, 0.024, -0.026)],
        { strands: 15, r: 0.030, w: 1.9, h: 0.52, endA: 0.80, endB: 0.42, bulge: 0.8,
          peak: 0.45, archOut: 0.072, color: c.color, tendon: c.tendon, rad: 10,
          map: function (s) { return Math.pow(s, 1.2); } });
    }
  });

  M({
    id: 'gluteus_medius', name: 'Gluteus medius', latin: 'M. gluteus medius',
    group: 'Hip', layer: 2, side: 'pair',
    origin: 'Outer surface of the ilium between the posterior and anterior gluteal lines',
    insertion: 'Lateral surface of the greater trochanter',
    action: 'Abducts the hip and keeps the pelvis level during single-leg stance',
    nerve: 'Superior gluteal nerve (L4–S1)',
    build: function (c) {
      return c.G.fan(
        [c.p('iliacPost', 0.004, -0.004, -0.006), c.p('iliacLat', 0.002, -0.002, 0.000), c.p('asis', 0.000, -0.006, -0.004)],
        [c.p('greaterTroch', 0.006, 0.006, -0.004)],
        { strands: 10, r: 0.020, w: 1.8, h: 0.50, endA: 0.82, endB: 0.28, bulge: 0.8,
          archOut: 0.026, color: c.color, tendon: c.tendon, rad: 9 });
    }
  });

  M({
    id: 'gluteus_minimus', name: 'Gluteus minimus', latin: 'M. gluteus minimus',
    group: 'Hip', layer: 3, side: 'pair',
    origin: 'Outer ilium between the anterior and inferior gluteal lines',
    insertion: 'Anterior border of the greater trochanter',
    action: 'Abducts and medially rotates the hip; stabilises the pelvis',
    nerve: 'Superior gluteal nerve (L4–S1)',
    build: function (c) {
      return c.G.fan(
        [c.p('iliacPost', 0.006, -0.018, 0.004), c.p('iliacLat', 0.000, -0.016, 0.004), c.p('asis', -0.004, -0.016, -0.006)],
        [c.p('greaterTroch', 0.002, 0.004, 0.006)],
        { strands: 5, r: 0.012, w: 1.3, h: 0.5, endA: 0.65, endB: 0.3, bulge: 0.7,
          color: c.color, tendon: c.tendon, rad: 8 });
    }
  });

  M({
    id: 'piriformis', name: 'Piriformis', latin: 'M. piriformis',
    group: 'Hip', layer: 3, side: 'pair',
    origin: 'Anterior surface of the sacrum',
    insertion: 'Superior border of the greater trochanter',
    action: 'Laterally rotates the extended hip and abducts the flexed hip',
    nerve: 'Nerve to piriformis (S1–S2)',
    build: function (c) {
      return c.G.belly([c.p('sacrum', 0.014, -0.014, 0.014), c.p('greaterTroch', -0.008, 0.002, 0.000)], {
        r: 0.012, w: 1.3, h: 0.7, endA: 0.55, endB: 0.35, bulge: 0.8,
        seg: 14, rad: 9, up: [0, 1, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'iliopsoas', name: 'Iliopsoas', latin: 'M. iliopsoas',
    group: 'Hip', layer: 3, side: 'pair',
    origin: 'Iliac fossa; bodies and transverse processes of T12–L5',
    insertion: 'Lesser trochanter of the femur',
    action: 'The chief flexor of the hip; also flexes the trunk on the thigh',
    nerve: 'Femoral nerve and anterior rami L1–L3',
    build: function (c) {
      var G = c.G, p = c.p;
      var psoas = G.belly([p('t12', 0.018, 0.010, 0.010), p('l3', 0.030, 0.000, 0.016),
                           p('asis', -0.028, -0.048, 0.010), p('lesserTroch', 0.000, 0.004, 0.002)], {
        r: 0.015, w: 1.1, h: 0.9, endA: 0.5, endB: 0.28, bulge: 0.9, peak: 0.45,
        seg: 26, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      var iliacus = G.fan(
        [p('iliacLat', -0.020, -0.010, 0.014), p('asis', -0.016, -0.026, 0.004)],
        [p('lesserTroch', 0.002, 0.006, 0.004)],
        { strands: 4, r: 0.012, w: 1.3, h: 0.5, endA: 0.6, endB: 0.3, bulge: 0.7,
          color: c.color, tendon: c.tendon, rad: 8 });
      return G.merge([psoas, iliacus]);
    }
  });

  M({
    id: 'tensor_fasciae_latae', name: 'Tensor fasciae latae', latin: 'M. tensor fasciae latae',
    group: 'Hip', layer: 1, side: 'pair',
    origin: 'Anterior superior iliac spine and anterior iliac crest',
    insertion: 'Iliotibial tract',
    action: 'Tenses the iliotibial tract, abducting and medially rotating the hip',
    nerve: 'Superior gluteal nerve (L4–S1)',
    build: function (c) {
      return c.G.belly([c.p('asis', 0.004, 0.004, 0.000), c.p('greaterTroch', 0.010, -0.030, 0.018), c.p('thighUp', 0.018, 0.010, 0.010)], {
        r: 0.014, w: 1.4, h: 0.6, endA: 0.5, endB: 0.4, bulge: 0.85,
        seg: 18, rad: 9, up: [0, 0, 1], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'iliotibial_tract', name: 'Iliotibial tract', latin: 'Tractus iliotibialis',
    group: 'Hip', layer: 1, side: 'pair', tendonous: true,
    origin: 'Tensor fasciae latae and gluteus maximus',
    insertion: "Gerdy's tubercle on the lateral tibial condyle",
    action: 'A fascial strap that stabilises the knee and the standing pelvis',
    nerve: '—',
    build: function (c) {
      return c.G.belly([c.p('greaterTroch', 0.012, -0.012, 0.008), c.p('femurMid', 0.026, 0.050, 0.000), c.p('femurLow', 0.028, 0.000, -0.002), c.p('fibHead', 0.004, 0.012, 0.010)], {
        r: 0.014, w: 1.5, h: 0.30, endA: 0.85, endB: 0.7, bulge: 0.3,
        seg: 24, rad: 8, up: [1, 0, 0], color: 0xe3d9c4, tendon: 0xeee6d5
      });
    }
  });

  /* ========================================================== THIGH ===== */

  M({
    id: 'sartorius', name: 'Sartorius', latin: 'M. sartorius',
    group: 'Thigh', layer: 1, side: 'pair',
    origin: 'Anterior superior iliac spine',
    insertion: 'Medial surface of the proximal tibia (pes anserinus)',
    action: 'Flexes, abducts and laterally rotates the hip; flexes the knee — the tailor’s cross-legged muscle',
    nerve: 'Femoral nerve (L2–L3)',
    build: function (c) {
      return c.G.belly([c.p('asis', 0.000, -0.002, 0.008), c.p('thighUp', 0.006, -0.020, 0.036),
                        c.p('femurMid', -0.026, -0.030, 0.026), c.p('femurLow', -0.030, -0.010, 0.000), c.p('tibMed', -0.004, 0.014, 0.006)], {
        r: 0.011, w: 1.5, h: 0.65, endA: 0.5, endB: 0.45, bulge: 0.7, peak: 0.45,
        seg: 40, rad: 9, up: [0, 0, 1], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'rectus_femoris', name: 'Rectus femoris', latin: 'M. rectus femoris',
    group: 'Thigh', layer: 1, side: 'pair',
    origin: 'Anterior inferior iliac spine',
    insertion: 'Patella, then the tibial tuberosity via the patellar ligament',
    action: 'Extends the knee and flexes the hip — the only quadriceps head crossing both joints',
    nerve: 'Femoral nerve (L2–L4)',
    build: function (c) {
      return c.G.belly([c.p('asis', -0.006, -0.026, 0.006), c.p('thighUp', -0.004, 0.006, 0.034),
                        c.p('femurMid', 0.000, 0.000, 0.040), c.p('patella', 0.000, 0.028, 0.004), c.p('tibTub', 0.000, 0.004, 0.000)], {
        r: 0.023, w: 1.15, h: 0.85, endA: 0.35, endB: 0.22, bulge: 1.0, peak: 0.42,
        seg: 36, rad: 12, up: [1, 0, 0.1], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'vastus_lateralis', name: 'Vastus lateralis', latin: 'M. vastus lateralis',
    group: 'Thigh', layer: 2, side: 'pair',
    origin: 'Greater trochanter and lateral lip of the linea aspera',
    insertion: 'Patella and the quadriceps tendon',
    action: 'Extends the knee; the largest of the four quadriceps heads',
    nerve: 'Femoral nerve (L2–L4)',
    build: function (c) {
      return c.G.belly([c.p('greaterTroch', 0.002, -0.016, 0.006), c.p('thighUp', 0.026, -0.010, 0.014),
                        c.p('femurMid', 0.028, -0.030, 0.020), c.p('patella', 0.018, 0.034, -0.002)], {
        r: 0.026, w: 1.1, h: 0.85, endA: 0.4, endB: 0.22, bulge: 0.95, peak: 0.5,
        seg: 30, rad: 12, up: [0.6, 0, 0.8], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'vastus_medialis', name: 'Vastus medialis', latin: 'M. vastus medialis',
    group: 'Thigh', layer: 2, side: 'pair',
    origin: 'Intertrochanteric line and medial lip of the linea aspera',
    insertion: 'Patella and the quadriceps tendon',
    action: 'Extends the knee and stabilises the patella medially',
    nerve: 'Femoral nerve (L2–L4)',
    build: function (c) {
      return c.G.belly([c.p('thighUp', -0.016, -0.030, 0.010), c.p('femurMid', -0.022, -0.048, 0.018), c.p('patella', -0.018, 0.028, 0.000)], {
        r: 0.023, w: 1.1, h: 0.85, endA: 0.45, endB: 0.25, bulge: 0.95, peak: 0.62,
        seg: 26, rad: 12, up: [-0.6, 0, 0.8], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'vastus_intermedius', name: 'Vastus intermedius', latin: 'M. vastus intermedius',
    group: 'Thigh', layer: 3, side: 'pair',
    origin: 'Anterior and lateral surfaces of the femoral shaft',
    insertion: 'Patella via the quadriceps tendon',
    action: 'Extends the knee; lies directly on the femur beneath rectus femoris',
    nerve: 'Femoral nerve (L2–L4)',
    build: function (c) {
      return c.G.belly([c.p('thighUp', 0.002, -0.020, 0.018), c.p('femurMid', 0.002, -0.020, 0.022), c.p('patella', 0.000, 0.030, -0.004)], {
        r: 0.020, w: 1.2, h: 0.7, endA: 0.55, endB: 0.25, bulge: 0.8,
        seg: 22, rad: 11, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'adductor_longus', name: 'Adductor longus', latin: 'M. adductor longus',
    group: 'Thigh', layer: 1, side: 'pair',
    origin: 'Body of the pubis below the pubic crest',
    insertion: 'Middle third of the linea aspera of the femur',
    action: 'Adducts and assists flexion of the hip',
    nerve: 'Obturator nerve (L2–L4)',
    build: function (c) {
      return c.G.belly([c.p('pubis', 0.008, 0.002, 0.004), c.p('thighUp', -0.028, -0.026, 0.010), c.p('femurMid', -0.014, 0.010, 0.000)], {
        r: 0.018, w: 1.3, h: 0.7, endA: 0.35, endB: 0.3, bulge: 0.9,
        seg: 22, rad: 11, up: [0, 0, 1], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'adductor_magnus', name: 'Adductor magnus', latin: 'M. adductor magnus',
    group: 'Thigh', layer: 2, side: 'pair',
    origin: 'Inferior pubic ramus and ischial tuberosity',
    insertion: 'Linea aspera and the adductor tubercle of the femur',
    action: 'Powerfully adducts the hip; the hamstring part extends it',
    nerve: 'Obturator nerve and tibial division of the sciatic nerve',
    build: function (c) {
      return c.G.fan(
        [c.p('pubicRamus', 0.000, -0.004, 0.000), c.p('ischium', 0.000, 0.000, -0.004)],
        [c.p('thighUp', -0.020, -0.040, -0.014), c.p('femurMid', -0.018, -0.010, -0.010), c.p('femurMed', -0.010, -0.100, -0.006)],
        { strands: 7, r: 0.016, w: 1.4, h: 0.6, endA: 0.5, endB: 0.4, bulge: 0.8,
          archOut: 0.006, color: c.color, tendon: c.tendon, rad: 9 });
    }
  });

  M({
    id: 'gracilis', name: 'Gracilis', latin: 'M. gracilis',
    group: 'Thigh', layer: 1, side: 'pair',
    origin: 'Body and inferior ramus of the pubis',
    insertion: 'Medial surface of the proximal tibia (pes anserinus)',
    action: 'Adducts the hip and flexes the knee',
    nerve: 'Obturator nerve (L2–L3)',
    build: function (c) {
      return c.G.belly([c.p('pubis', 0.006, -0.010, -0.002), c.p('femurMid', -0.028, 0.040, 0.002), c.p('femurLow', -0.026, 0.000, 0.000), c.p('tibMed', -0.006, 0.020, 0.000)], {
        r: 0.011, w: 1.3, h: 0.7, endA: 0.4, endB: 0.35, bulge: 0.75, peak: 0.4,
        seg: 30, rad: 9, up: [0, 0, 1], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'pectineus', name: 'Pectineus', latin: 'M. pectineus',
    group: 'Thigh', layer: 2, side: 'pair',
    origin: 'Pecten of the pubis',
    insertion: 'Pectineal line of the femur',
    action: 'Adducts and flexes the hip',
    nerve: 'Femoral nerve (L2–L3)',
    build: function (c) {
      return c.G.belly([c.p('pubis', 0.016, 0.012, 0.008), c.p('lesserTroch', 0.002, -0.028, 0.000)], {
        r: 0.013, w: 1.3, h: 0.6, endA: 0.5, endB: 0.4, bulge: 0.7,
        seg: 14, rad: 9, up: [0, 0, 1], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'biceps_femoris', name: 'Biceps femoris', latin: 'M. biceps femoris',
    group: 'Thigh', layer: 1, side: 'pair',
    origin: 'Long head: ischial tuberosity. Short head: linea aspera',
    insertion: 'Head of the fibula',
    action: 'Flexes the knee and laterally rotates it; the long head extends the hip',
    nerve: 'Sciatic nerve (L5–S2)',
    build: function (c) {
      var G = c.G, p = c.p;
      var longHead = G.belly([p('ischium', 0.006, 0.004, -0.004), p('thighUp', 0.006, -0.026, -0.038),
                              p('femurMid', 0.014, -0.020, -0.038), p('fibHead', 0.004, 0.014, -0.004)], {
        r: 0.019, w: 1.15, h: 0.8, endA: 0.35, endB: 0.22, bulge: 0.95, peak: 0.45,
        seg: 32, rad: 11, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      var shortHead = G.belly([p('femurMid', 0.016, -0.026, -0.026), p('femurLow', 0.018, -0.012, -0.030), p('fibHead', 0.006, 0.016, -0.010)], {
        r: 0.013, w: 1.15, h: 0.75, endA: 0.5, endB: 0.3, bulge: 0.8,
        seg: 18, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      return G.merge([longHead, shortHead]);
    }
  });

  M({
    id: 'semitendinosus', name: 'Semitendinosus', latin: 'M. semitendinosus',
    group: 'Thigh', layer: 1, side: 'pair',
    origin: 'Ischial tuberosity',
    insertion: 'Medial surface of the proximal tibia (pes anserinus)',
    action: 'Extends the hip and flexes the knee with medial rotation',
    nerve: 'Tibial division of the sciatic nerve (L5–S2)',
    build: function (c) {
      return c.G.belly([c.p('ischium', -0.004, 0.002, -0.006), c.p('thighUp', -0.022, -0.020, -0.038),
                        c.p('femurMid', -0.020, -0.010, -0.036), c.p('femurLow', -0.024, 0.000, -0.024), c.p('tibMed', -0.004, 0.026, -0.006)], {
        r: 0.015, w: 1.1, h: 0.85, endA: 0.35, endB: 0.16, bulge: 1.0, peak: 0.38,
        seg: 34, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'semimembranosus', name: 'Semimembranosus', latin: 'M. semimembranosus',
    group: 'Thigh', layer: 2, side: 'pair',
    origin: 'Ischial tuberosity (deep to semitendinosus)',
    insertion: 'Medial condyle of the tibia',
    action: 'Extends the hip and flexes the knee with medial rotation',
    nerve: 'Tibial division of the sciatic nerve (L5–S2)',
    build: function (c) {
      return c.G.belly([c.p('ischium', -0.002, -0.004, 0.002), c.p('thighUp', -0.030, -0.030, -0.026),
                        c.p('femurMid', -0.030, -0.016, -0.026), c.p('condyleMed', -0.006, 0.014, -0.016)], {
        r: 0.016, w: 1.2, h: 0.8, endA: 0.4, endB: 0.28, bulge: 0.9, peak: 0.55,
        seg: 28, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  /* ============================================================ LEG ===== */

  M({
    id: 'gastrocnemius', name: 'Gastrocnemius', latin: 'M. gastrocnemius',
    group: 'Leg', layer: 1, side: 'pair',
    origin: 'Posterior surfaces of the medial and lateral femoral condyles',
    insertion: 'Calcaneus via the calcaneal (Achilles) tendon',
    action: 'Plantarflexes the ankle and assists knee flexion — the push-off muscle',
    nerve: 'Tibial nerve (S1–S2)',
    build: function (c) {
      var G = c.G, p = c.p;
      var med = G.belly([p('condyleMed', 0.004, 0.010, -0.020), p('calf', -0.020, 0.030, -0.014),
                         p('calf', -0.014, -0.060, -0.004), p('ankle', -0.004, 0.010, -0.030)], {
        r: 0.022, w: 1.05, h: 0.9, endA: 0.4, endB: 0.14, bulge: 1.05, peak: 0.36,
        seg: 30, rad: 12, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      var lat = G.belly([p('condyleLat', -0.004, 0.010, -0.020), p('calf', 0.016, 0.026, -0.014),
                         p('calf', 0.012, -0.060, -0.004), p('ankle', 0.004, 0.008, -0.030)], {
        r: 0.019, w: 1.05, h: 0.9, endA: 0.4, endB: 0.14, bulge: 1.05, peak: 0.34,
        seg: 30, rad: 12, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
      var achilles = G.belly([p('calf', 0.000, -0.100, -0.006), p('ankle', 0.000, 0.026, -0.036), p('calcaneus', 0.000, 0.006, -0.010)], {
        r: 0.011, w: 1.2, h: 0.75, endA: 0.85, endB: 0.75, bulge: 0.3,
        seg: 16, rad: 9, up: [1, 0, 0], color: 0xe6dcc6, tendon: 0xefe8d8
      });
      return G.merge([med, lat, achilles]);
    }
  });

  M({
    id: 'soleus', name: 'Soleus', latin: 'M. soleus',
    group: 'Leg', layer: 2, side: 'pair',
    origin: 'Posterior head of the fibula and soleal line of the tibia',
    insertion: 'Calcaneus via the calcaneal tendon',
    action: 'Plantarflexes the ankle and keeps the body upright over the foot',
    nerve: 'Tibial nerve (S1–S2)',
    build: function (c) {
      return c.G.belly([c.p('fibHead', -0.004, -0.024, -0.016), c.p('calf', 0.000, 0.020, -0.006),
                        c.p('calf', 0.000, -0.090, 0.000), c.p('calcaneus', 0.000, 0.016, -0.012)], {
        r: 0.024, w: 1.25, h: 0.85, endA: 0.55, endB: 0.14, bulge: 0.85, peak: 0.40,
        seg: 28, rad: 11, up: [0, 0, 1], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'tibialis_anterior', name: 'Tibialis anterior', latin: 'M. tibialis anterior',
    group: 'Leg', layer: 1, side: 'pair',
    origin: 'Lateral condyle and proximal lateral surface of the tibia',
    insertion: 'Medial cuneiform and base of the first metatarsal',
    action: 'Dorsiflexes and inverts the foot; controls foot lowering in walking',
    nerve: 'Deep fibular nerve (L4–L5)',
    build: function (c) {
      return c.G.belly([c.p('tibTub', 0.010, 0.006, -0.008), c.p('shinMid', 0.012, 0.060, 0.010),
                        c.p('shinMid', 0.008, -0.060, 0.006), c.p('midfoot', -0.010, 0.020, 0.000)], {
        r: 0.016, w: 1.15, h: 0.8, endA: 0.4, endB: 0.14, bulge: 0.95, peak: 0.34,
        seg: 30, rad: 11, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'fibularis_longus', name: 'Fibularis longus', latin: 'M. fibularis longus',
    group: 'Leg', layer: 1, side: 'pair',
    origin: 'Head and proximal lateral surface of the fibula',
    insertion: 'Medial cuneiform and first metatarsal, crossing the sole of the foot',
    action: 'Everts and plantarflexes the foot; supports the transverse arch',
    nerve: 'Superficial fibular nerve (L5–S1)',
    build: function (c) {
      return c.G.belly([c.p('fibHead', 0.004, -0.010, 0.000), c.p('fibMid', 0.008, 0.050, -0.004),
                        c.p('fibMid', 0.006, -0.070, -0.008), c.p('malleolusLat', 0.004, -0.012, -0.010), c.p('midfoot', 0.014, 0.008, -0.010)], {
        r: 0.012, w: 1.1, h: 0.8, endA: 0.45, endB: 0.14, bulge: 0.95, peak: 0.3,
        seg: 30, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'extensor_digitorum_longus', name: 'Extensor digitorum longus', latin: 'M. extensor digitorum longus',
    group: 'Leg', layer: 2, side: 'pair',
    origin: 'Lateral condyle of the tibia and anterior fibula',
    insertion: 'Middle and distal phalanges of the four lateral toes',
    action: 'Extends the toes and dorsiflexes the ankle',
    nerve: 'Deep fibular nerve (L5–S1)',
    build: function (c) {
      return c.G.belly([c.p('fibHead', 0.000, -0.014, 0.012), c.p('shinMid', 0.020, 0.040, 0.006),
                        c.p('shinMid', 0.016, -0.070, 0.004), c.p('footFront', 0.000, 0.010, -0.010)], {
        r: 0.011, w: 1.1, h: 0.75, endA: 0.45, endB: 0.12, bulge: 0.9, peak: 0.32,
        seg: 26, rad: 10, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'tibialis_posterior', name: 'Tibialis posterior', latin: 'M. tibialis posterior',
    group: 'Leg', layer: 3, side: 'pair',
    origin: 'Interosseous membrane and adjacent tibia and fibula',
    insertion: 'Navicular, cuneiforms and metatarsals 2–4',
    action: 'Inverts and plantarflexes the foot; the main support of the medial arch',
    nerve: 'Tibial nerve (L4–L5)',
    build: function (c) {
      return c.G.belly([c.p('tibPlateau', 0.004, -0.060, -0.020), c.p('shinMid', 0.000, 0.000, -0.014),
                        c.p('malleolusMed', 0.006, 0.020, -0.012), c.p('midfoot', -0.008, 0.012, -0.020)], {
        r: 0.011, w: 1.1, h: 0.8, endA: 0.5, endB: 0.14, bulge: 0.85, peak: 0.35,
        seg: 24, rad: 9, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });

  M({
    id: 'flexor_digitorum_longus', name: 'Flexor digitorum longus', latin: 'M. flexor digitorum longus',
    group: 'Leg', layer: 3, side: 'pair',
    origin: 'Posterior surface of the tibia',
    insertion: 'Distal phalanges of the four lateral toes',
    action: 'Flexes the toes and plantarflexes the ankle; grips the ground in walking',
    nerve: 'Tibial nerve (L5–S1)',
    build: function (c) {
      return c.G.belly([c.p('tibPlateau', -0.006, -0.070, -0.024), c.p('shinMid', -0.012, -0.010, -0.020),
                        c.p('malleolusMed', 0.000, 0.010, -0.018), c.p('footFront', -0.004, 0.006, -0.020)], {
        r: 0.010, w: 1.1, h: 0.8, endA: 0.5, endB: 0.12, bulge: 0.85, peak: 0.35,
        seg: 24, rad: 9, up: [1, 0, 0], color: c.color, tendon: c.tendon
      });
    }
  });
})(window);
