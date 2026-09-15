# Fitting the atlas to the supplied base mesh

The muscles and skeleton in this project are authored against the landmark table
in `js/landmarks.js`, which describes one particular 1.80 m figure standing with
its arms close to its sides. The supplied mesh (`FinalBaseMesh.obj`, 24,461
vertices, 24,459 quads) is a different person in a different pose. These are the
measurements that let `js/retarget.js` move one onto the other.

## Normalising the mesh

`tools/prepare-mesh.js` scales the mesh by 0.08679 so it stands 1.80 m tall,
centres it left to right, and puts its feet on y = 0. Everything below is in
those normalised metres.

## What the mesh is

| Measure | Value |
| --- | --- |
| Height | 1.800 |
| Width, fingertip to fingertip | 1.014 |
| Depth, toe to heel | 0.327 |
| Crotch | 0.790 |
| Narrowest neck | y 1.587, half-width 0.060 |
| Head | 1.60 – 1.80, half-width 0.090 |

The arms hang about 23° from vertical rather than at the sides, which is the
single biggest difference from the authored figure: at elbow height the humerus
sits 12 cm further out.

## Trunk half-width, by height

Measured by slicing the mesh and keeping the cluster that contains the midline,
so the arms are excluded. Above y ≈ 1.26 the arm merges with the trunk and the
trunk can no longer be separated this way.

| y | half-width | z back | z front |
| --- | --- | --- | --- |
| 0.80 | 0.191 | -0.096 | 0.092 |
| 0.92 | 0.169 | -0.129 | 0.099 |
| 1.03 | 0.150 | -0.115 | 0.101 |
| 1.14 | 0.144 | -0.094 | 0.099 |
| 1.25 | 0.168 | -0.130 | 0.097 |

## Joint centres

Taken from the centroid of each limb slice, with the joints placed at the local
minima of limb girth. Right side; the left is mirrored.

| Joint | Position | Local girth |
| --- | --- | --- |
| Shoulder | 0.240, 1.395, -0.070 | upper arm r 0.068 |
| Elbow | 0.338, 1.168, -0.062 | |
| Wrist | 0.437, 0.978, -0.040 | r 0.029 |
| Fingertips | 0.487, 0.822, -0.030 | |
| Hip | 0.104, 0.850, -0.005 | thigh r 0.087 |
| Knee | 0.142, 0.500, -0.028 | r 0.061 |
| Ankle | 0.155, 0.098, -0.062 | r 0.033 |
| Toe | 0.170, 0.012, 0.150 | |

## How well it fits

After warping, a sampled containment test (rays cast from muscle vertices
through the body mesh, counting crossings) puts about 95% of muscle vertices
inside the body. The trunk muscles sit within 1–3 cm of the mesh's own surface,
which is where muscle belongs under skin. What sticks out is mostly the
platysma and splenius capitis on a slim neck, and the wrist flexors and
extensors on slim forearms — all hidden by the gym filter or by the depth
slider.

## Re-running the measurements

```sh
node tools/prepare-mesh.js path/to/FinalBaseMesh.obj assets/body-mesh.js
```

The joint numbers above were produced by slicing the mesh in Python; the values
live in `TARGET` at the top of `js/retarget.js`. If you swap in a different body
mesh, those are the numbers to re-measure.
