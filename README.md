# Human Atlas 3D

An interactive 3D human figure that runs in a browser with no build step. The
figure starts as a skinned body and can be stripped back to muscle and then to
bone, and any single muscle can be taken off the body on its own. By default it
shows only the muscles a lifter actually trains, grouped the way a training
programme is.

The body is the supplied `FinalBaseMesh.obj`, converted to a compact binary. The
skeleton and all 69 muscles are generated procedurally at load time and fitted
to that body.

![the model](docs/preview.png)

## What it does

- **Three layers, one figure.** *Body* is the person with skin on; *Muscles*
  fades the skin away and shows the musculature over the skeleton; *Skeleton*
  leaves bone alone. While dissecting, a translucent ghost of the body keeps its
  outline for reference.
- **Gym filter, on by default.** 51 muscles that a lifter trains, grouped as
  chest, back, shoulders, arms, forearms, core, glutes and hips, quads,
  hamstrings, adductors, calves and neck, each naming the exercises that work
  it. Searching "bench" or "deadlift" finds the muscles those lifts train.
  Switch to *All muscles* for the full 69, respiratory and facial ones included.
- **69 muscles in the atlas**, 137 individual parts once the bilateral pairs are
  built, laid over a simplified skeleton.
- **Disassemble any muscle individually.** Click it in the 3D view or in the
  list and press *Disassemble*; it floats off the body along its own outward
  axis, keeps a leader line back to where it belongs, and labels itself.
  *Disassemble all* turns the whole figure into an exploded diagram.
- **Depth slider** peels the anatomy back: superficial only, through
  intermediate, or all three layers.
- **X-ray slider**, left/right isolation, per-muscle hide, isolate mode,
  labels, and view presets for front, back, side, upper and lower body.
- **Reference data** for each muscle: origin, insertion, action and innervation.

## Running it

Serve the folder and open it. A local server is needed because the body mesh is
loaded from `assets/body.bin`, which a browser will not fetch from a `file://`
page:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Nothing is fetched from the network: `vendor/three.min.js` is bundled, and the
page falls back to the three.js CDN only if that file is missing. If the body
mesh cannot be loaded the viewer says so and opens in the muscle layer, which
needs no assets at all.

## Controls

| Input | Action |
| --- | --- |
| Drag | Orbit |
| Wheel / pinch | Zoom |
| Shift+drag, right-drag | Pan |
| Click | Select a muscle |
| Double-click | Disassemble it and zoom in |
| `D` | Disassemble / re-attach the selection |
| `H` | Hide / show it |
| `I` | Isolate |
| `X` | X-ray |
| `L` | Labels |
| `1` `2` `3` | Body, muscles, skeleton |
| `A` | Gym muscles / all muscles |
| `G` | Ghost skin on/off |
| `R` | Reset everything |

## Fitting the anatomy to the body

`tools/prepare-mesh.js` turns the supplied OBJ into `assets/body.bin`: scaled to
a 1.80 m figure, stood on the floor, triangulated, smooth-normalled, about
1.2 MB.

The muscles are authored against one particular figure, and the supplied mesh is
a different person in a different pose, with the arms held well away from the
body. Rather than re-author every muscle, the finished geometry is warped.
`js/retarget.js` holds nine bones per side, each pairing a segment of the
authored body with the matching segment measured off the mesh, and each carrying
a rotation, a scale along its axis and a scale across it. A vertex takes a
weighted blend of the bones near it.

Two details make that work. Distances are measured in units of each bone's own
thickness, so a centimetre from the humerus counts as close while a centimetre
from the trunk's axis is still deep inside the chest. And a muscle only sees the
bones it actually articulates on, with a weight: the pectoral sheet is written
as `['thorax', 'clavicle*0.35', 'upperArm*0.03']`, which keeps it lying on the
chest wall while its tendon end still follows the humerus out to the abducted
arm. Without either, the arm captures the whole chest and drags it sideways.

`tools/fit-report.md` records the measurements and how closely the result fits.

## How the anatomy is built

There are no `.glb` or `.obj` assets. Two generators in `js/geom.js` produce
almost every structure:

- `belly(path, opts)` sweeps a fusiform muscle belly along a Catmull-Rom spline.
  The radius follows a profile that tapers to tendon at both ends, and the
  cross-section is an ellipse, so the same function makes a round biceps and a
  flat strap like sartorius. Vertex colours are baked as it goes, so thin
  tendinous ends read pale and the thick belly reads red.
- `fan(origin, insertion, opts)` runs a sheet of fascicles from an origin
  polyline to an insertion polyline. That covers pectoralis major, trapezius,
  latissimus dorsi, the deltoid, the glutes and the abdominal obliques.

Both take an `up` vector that decides which way the muscle is flattened. For
sheet muscles it defaults to the outward normal of the trunk, computed as an
ellipse in cross-section, because the torso is much wider than it is deep.

`js/landmarks.js` holds the skeletal attachment points that everything else is
measured from, in metres, for a 1.80 m figure standing in anatomical position.
Only the right side exists; left-side muscles are mirrored geometry, so the two
sides can never drift apart.

## Layout

```
index.html            page shell
css/styles.css        interface styling
js/geom.js            belly / fan / plate geometry generators
js/landmarks.js       skeletal attachment points and rib paths
js/skeleton.js        the simplified skeleton
js/bodymesh.js        loads the supplied body mesh
js/retarget.js        fits the anatomy to that body
js/gym.js             which muscles lifters train, and what trains them
assets/body.bin       the body mesh, built by tools/prepare-mesh.js
js/muscles.js         head, neck, chest and abdomen
js/muscles-upper.js   back, shoulder, arm and forearm
js/muscles-lower.js   hip, thigh and leg
js/orbit.js           camera controller
js/app.js             scene, interaction and interface
vendor/three.min.js   bundled three.js r128
```

## Adding a muscle

Append an entry to one of the `js/muscles*.js` files. It appears in the list, the
search index, the depth layers and the disassembly controls automatically:

```js
M({
  id: 'popliteus', name: 'Popliteus', latin: 'M. popliteus',
  group: 'Leg', layer: 3, side: 'pair',
  origin: 'Lateral condyle of the femur',
  insertion: 'Posterior surface of the proximal tibia',
  action: 'Unlocks the extended knee by rotating the femur laterally',
  nerve: 'Tibial nerve (L4–S1)',
  build: function (c) {
    return c.G.belly([c.p('condyleLat'), c.p('tibPlateau', -0.02, -0.03, -0.02)], {
      r: 0.010, w: 1.3, h: 0.6, up: [0, 0, -1], color: c.color, tendon: c.tendon
    });
  }
});
```

## Credits and accuracy

The body mesh is the `FinalBaseMesh.obj` supplied for this project; check its
licence before redistributing the built `assets/body.bin`. Everything else here
is generated from code.

This is a teaching diagram, not a medical reference. Attachments, layering and
actions follow standard anatomy, but the shapes are parametric approximations:
fascicle counts are stylised, the skeleton is simplified, and the hands, feet,
face and deep intrinsic muscles are represented only in outline. The figure is
one body, not a population, and the exercise lists name the lifts a muscle
contributes to rather than ranking them.

## Console access

The viewer is exposed as `HB.app` for scripting: `HB.app.detach('deltoid.R')`,
`HB.app.select('soleus.L')`, `HB.app.detachAll(true)`, `HB.app.reset()`.
`HB.buildRetarget()` returns the fitting rig, and `HB.GYM` is the training table.
