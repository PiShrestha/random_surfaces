# Random Surfaces

Monotonic coupling simulation on lattice paths. Two Markov chains start at opposite extremes of an N×M grid and converge to a single random path using directional corner-flips — demonstrating how coupling gives an upper bound on mixing time.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)

## How It Works

Each **lattice path** is a sequence of N "Right" and M "Up" steps on a grid. We run two chains simultaneously:

| Chain      | Start state  | Description                     |
| ---------- | ------------ | ------------------------------- |
| **Top**    | `UUU…URRR…R` | Highest path (hugs top-left)    |
| **Bottom** | `RRR…RUUU…U` | Lowest path (hugs bottom-right) |

At every step the **same** random index `k` and direction (UP or DOWN) are applied to both chains. The directional corner-flip is _monotone_ — the gap between the chains can only shrink. When the two paths become identical, they have **coupled**, and the step count is an upper bound on the mixing time.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PiShrestha/random_surfaces.git
cd random_surfaces
```

### 2. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install matplotlib
```

### 4. Run the simulation

```bash
python random_paths.py
```

This will:

1. Run the monotonic coupling on a 15×15 grid.
2. Print the coupling (mixing) time to the terminal.
3. Show an **animated** two-panel figure — lattice paths converging on the left, Hamming-distance gap on the right.
4. Show a **static** four-panel summary (start / midway / coupled snapshots + convergence curve).

## Configuration

Edit the constants at the top of `random_paths.py`:

| Parameter           | Default | Description                         |
| ------------------- | ------- | ----------------------------------- |
| `N`                 | 15      | Grid width (number of Right steps)  |
| `M`                 | 15      | Grid height (number of Up steps)    |
| `SNAPSHOT_INTERVAL` | 50      | Record a frame every _n_ MCMC steps |

## Example Output

```
Grid size : 15 × 15
Path length: 30 steps (15 Rights, 15 Ups)

Running monotonic coupling …

✓  Chains coupled after 14,908 steps.
   (300 snapshots recorded for visualisation)
```

## License

See [LICENSE](LICENSE) for details.
