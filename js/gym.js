/*
 * gym.js — which muscles matter in the weight room, and what trains them.
 *
 * The atlas carries every muscle it models; this table marks the ones a lifter
 * actually works, groups them the way a training programme does (chest, back,
 * shoulders, arms, …) rather than the way an anatomy text does, and names a few
 * exercises for each. Muscles missing from this table are respiratory, facial,
 * or deep stabilisers nobody trains directly, and they are hidden while the
 * gym filter is on.
 */
(function (global) {
  'use strict';
  var HB = (global.HB = global.HB || {});

  HB.GYM_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Forearms', 'Core',
                   'Glutes & hips', 'Quads', 'Hamstrings', 'Adductors', 'Calves', 'Neck'];

  HB.GYM = {
    /* ---- chest ---- */
    pectoralis_major:     ['Chest', 'Bench press, push-up, cable fly, dip'],
    serratus_anterior:    ['Chest', 'Push-up plus, overhead press, ab rollout'],

    /* ---- back ---- */
    latissimus_dorsi:     ['Back', 'Pull-up, lat pulldown, barbell row'],
    trapezius:            ['Back', 'Shrug, face pull, deadlift hold, upright row'],
    rhomboids:            ['Back', 'Seated row, face pull, reverse fly'],
    erector_spinae:       ['Back', 'Deadlift, back extension, good morning'],
    teres_major:          ['Back', 'Pull-up, lat pulldown, straight-arm pulldown'],
    levator_scapulae:     ['Back', 'Shrug, neck extension'],
    quadratus_lumborum:   ['Back', 'Side plank, suitcase carry, back extension'],

    /* ---- shoulders ---- */
    deltoid:              ['Shoulders', 'Overhead press, lateral raise, rear-delt fly'],
    infraspinatus:        ['Shoulders', 'External rotation, face pull, band pull-apart'],
    teres_minor:          ['Shoulders', 'External rotation, band pull-apart'],
    supraspinatus:        ['Shoulders', 'Lateral raise, cuff work with a light band'],

    /* ---- arms ---- */
    biceps_brachii:       ['Arms', 'Barbell curl, chin-up, incline dumbbell curl'],
    brachialis:           ['Arms', 'Hammer curl, reverse curl'],
    triceps_brachii:      ['Arms', 'Close-grip bench, pushdown, dip, skull crusher'],

    /* ---- forearms ---- */
    brachioradialis:      ['Forearms', 'Hammer curl, reverse curl'],
    flexor_carpi_radialis:['Forearms', 'Wrist curl, farmer’s carry'],
    flexor_carpi_ulnaris: ['Forearms', 'Wrist curl, grip work'],
    ext_carpi_radialis:   ['Forearms', 'Reverse wrist curl, reverse curl'],
    ext_carpi_ulnaris:    ['Forearms', 'Reverse wrist curl'],
    extensor_digitorum:   ['Forearms', 'Reverse curl, finger extension band'],
    flexor_digitorum_sup: ['Forearms', 'Dead hang, farmer’s carry, heavy row'],
    pronator_teres:       ['Forearms', 'Pronation work, hammer curl'],

    /* ---- core ---- */
    rectus_abdominis:     ['Core', 'Crunch, hanging leg raise, ab rollout'],
    external_oblique:     ['Core', 'Russian twist, side plank, cable chop'],
    internal_oblique:     ['Core', 'Russian twist, side plank, Pallof press'],
    transversus_abdominis:['Core', 'Plank, dead bug, stomach vacuum'],

    /* ---- glutes and hips ---- */
    gluteus_maximus:      ['Glutes & hips', 'Squat, hip thrust, deadlift, lunge'],
    gluteus_medius:       ['Glutes & hips', 'Hip abduction, banded walk, single-leg work'],
    gluteus_minimus:      ['Glutes & hips', 'Hip abduction, banded walk'],
    tensor_fasciae_latae: ['Glutes & hips', 'Hip abduction, side plank'],
    iliopsoas:            ['Glutes & hips', 'Hanging leg raise, hip-flexor march'],
    sartorius:            ['Glutes & hips', 'Lunge, step-up, hip-flexor work'],

    /* ---- quads ---- */
    rectus_femoris:       ['Quads', 'Squat, leg extension, lunge'],
    vastus_lateralis:     ['Quads', 'Squat, leg press, hack squat'],
    vastus_medialis:      ['Quads', 'Squat, leg extension, split squat'],
    vastus_intermedius:   ['Quads', 'Squat, leg press'],

    /* ---- hamstrings ---- */
    biceps_femoris:       ['Hamstrings', 'Romanian deadlift, leg curl, good morning'],
    semitendinosus:       ['Hamstrings', 'Romanian deadlift, leg curl, Nordic curl'],
    semimembranosus:      ['Hamstrings', 'Romanian deadlift, leg curl'],

    /* ---- adductors ---- */
    adductor_longus:      ['Adductors', 'Adduction machine, sumo squat, Copenhagen plank'],
    adductor_magnus:      ['Adductors', 'Sumo deadlift, deep squat, adduction machine'],
    gracilis:             ['Adductors', 'Adduction machine, Copenhagen plank'],
    pectineus:            ['Adductors', 'Adduction machine, sumo squat'],

    /* ---- calves ---- */
    gastrocnemius:        ['Calves', 'Standing calf raise, jump rope'],
    soleus:               ['Calves', 'Seated calf raise, long walks'],
    tibialis_anterior:    ['Calves', 'Tibialis raise, toe raise'],
    fibularis_longus:     ['Calves', 'Ankle eversion, balance work'],

    /* ---- neck ---- */
    sternocleidomastoid:  ['Neck', 'Neck flexion, harness work'],
    splenius_capitis:     ['Neck', 'Neck extension, harness work']
  };

  /* Attach the training data to each muscle definition. */
  HB.applyGym = function () {
    var n = 0;
    (HB.MUSCLES || []).forEach(function (def) {
      var g = HB.GYM[def.id];
      if (!g) { def.gym = null; return; }
      def.gym = { group: g[0], trains: g[1] };
      n++;
    });
    return n;
  };
})(window);
