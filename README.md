# Math Experimental Lab: Random Surfaces and Random Permutations

> **UVA Math Experimental Lab — Spring 2026**
> Mentored by [Leonid Petrov](https://lpetrov.cc/)
> Course page: <https://lpetrov.cc/mel-s26/>

Monotonic coupling simulation on lattice paths.
Two Markov chains start at opposite extremes of an N×M grid and converge to a
single random path using directional corner-flips — demonstrating how coupling
gives an upper bound on mixing time.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/repo-PiShrestha/random__surfaces-181717?logo=github)](https://github.com/PiShrestha/random_surfaces)

---

## Abstract

Imagine a 100 × 100 × 100 room in which you stack unit cubes in a corner at
random. What does the resulting pile look like? Each cross-section of such a
pile is a **lattice path** — a sequence of N "Right" and M "Up" steps. The
uniform distribution over these paths is the stationary measure of a simple
Markov chain whose transitions are _corner flips_.

We study **monotonic coupling** to estimate the _mixing time_ of this chain —
the number of steps needed for the chain to be approximately stationary.
By running two copies from opposite extremes with shared randomness, the
coupling is monotone and the coupling time yields an upper bound:

$$
t_{\text{mix}}(\varepsilon) \;\le\; \mathbb{E}[T_{\text{couple}}]
$$

For the N × M lattice-path chain the mixing time scales as Θ(N² M²).

---

## Repository Layout

```
random_paths.py     CLI simulation: monotonic coupling (animated + static plots)
random_walk.py      CLI simulation: coupled vs. uncoupled comparison dashboard
api/index.py        Flask backend  (Python serverless on Vercel)
app/                Next.js frontend  (see README.web.md)
components/         React components
hooks/              React hooks
lib/                Shared TypeScript types
```

---

## Installation (Python Scripts)

```bash
# 1. Clone
git clone https://github.com/PiShrestha/random_surfaces.git
cd random_surfaces

# 2. Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate   # macOS / Linux
# .venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install matplotlib flask
```

---

## Usage

### Monotonic Coupling Simulation

```bash
python random_paths.py
```

Edit the constants at the top of `random_paths.py`:

| Parameter           | Default  | Description                                    |
| ------------------- | -------- | ---------------------------------------------- |
| `N`                 | `10`     | Grid width (number of Right steps)             |
| `M`                 | `10`     | Grid height (number of Up steps)               |
| `SNAPSHOT_INTERVAL` | `100`    | Record an animation frame every _n_ MCMC steps |
| `METRIC`            | `'area'` | Gap metric: `'area'` or `'hamming'`            |

**Output:**

1. Terminal prints the coupling time.
2. An animated two-panel figure (lattice paths + convergence curve).
3. A static four-panel summary (start / midway / coupled / gap curve).

### Coupled vs. Uncoupled Comparison

```bash
python random_walk.py
```

| Parameter           | Default   | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| `N`                 | `30`      | Grid width                                 |
| `M`                 | `30`      | Grid height                                |
| `SNAPSHOT_INTERVAL` | `3000`    | Snapshot frequency                         |
| `MAX_STEPS`         | `300_000` | Stop uncoupled chain after this many steps |
| `BLIT`              | `False`   | Matplotlib blitting (set `True` for speed) |

---

## Algorithm Details

### Lattice Paths

A path is a string of length N + M over the alphabet {R, U}. There are
C(N+M, N) such paths. Each path traces a route from (0, 0) to (N, M) on the
integer lattice.

### Directional Corner Flip

At each MCMC step we choose a random index _k ∈ {0, …, N+M−2}_ and a random
direction _d ∈ {UP, DOWN}_:

- **UP (d = 1):** if `path[k:k+2] == "RU"` → swap to `"UR"`.
- **DOWN (d = 0):** if `path[k:k+2] == "UR"` → swap to `"RU"`.
- Otherwise: self-loop (no change).

This transition is **monotone** with respect to the dominance partial order on
paths: if A ≥ B before the flip, then A ≥ B after the flip.

### Monotonic Coupling

We initialise:

- **Top chain** = U^M R^N (maximal path, hugs top-left corner)
- **Bottom chain** = R^N U^M (minimal path, hugs bottom-right corner)

Both chains share the _same_ random (k, d) at every step. Because the flip is
monotone, the gap between the two chains can only shrink. When they become
identical, they have **coupled**.

### Gap Metrics

| Metric               | Formula                           | Meaning                                 |
| -------------------- | --------------------------------- | --------------------------------------- |
| **Hamming distance** | Σ 𝟏[aᵢ ≠ bᵢ]                      | Positions where the path strings differ |
| **Area**             | area_under(top) − area_under(bot) | Unit squares between paths              |

---

## Example Output

```
Grid size : 10 × 10
Path length: 20 steps (10 Rights, 10 Ups)

Running monotonic coupling …

✓  Chains coupled after 3,969 steps.
   (398 snapshots recorded for visualisation)
```

---

## Web Interface

An interactive web visualiser is also available — see [README.web.md](README.web.md)
for frontend setup and deployment instructions.

---

## References

- **Course:** [Math Experimental Lab — Random Surfaces and Random Permutations](https://lpetrov.cc/mel-s26/)
  (UVA, Spring 2026, mentored by Leonid Petrov)
- **Markov chain introduction:** [YouTube — Markov Chain Video](https://www.youtube.com/watch?v=CIe869Rce2k)
- **Random lozenge tilings:** [YouTube — Random Rhombus Tilings](https://www.youtube.com/watch?v=c6J_bd9seMg)
- **UVA Math Experimental Lab:** <https://math.virginia.edu/mathexlab/>

---

## License

MIT — see [LICENSE](LICENSE) for details.
