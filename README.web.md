# Random Surfaces Visualiser — Web Portal

> **Interactive web interface for the Monotonic Coupling Simulator**
> Part of [Math Experimental Lab: Random Surfaces and Random Permutations](https://lpetrov.cc/mel-s26/)
> UVA, Spring 2026 — Mentored by [Leonid Petrov](https://lpetrov.cc/)

[![GitHub](https://img.shields.io/badge/repo-PiShrestha/random__surfaces-181717?logo=github)](https://github.com/PiShrestha/random_surfaces)

---

## Tech Stack

| Layer      | Technology                          | Purpose                                      |
| ---------- | ----------------------------------- | -------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript | SSR / routing / page shell                   |
| Styling    | Tailwind CSS                        | Utility-first styling, dark/light mode       |
| Math       | KaTeX                               | Inline & block LaTeX rendering               |
| Canvas     | HTML5 Canvas API                    | Lattice path + convergence chart rendering   |
| Backend    | Python 3 / Flask                    | MCMC coupling algorithm (serverless)         |
| Deployment | Vercel                              | Free-tier hosting (Next.js + Python runtime) |

---

## Architecture

```
Browser  ──→  Next.js (React)  ──→  /api/init   (POST)  ──→  Flask (Python)
                                    /api/batch  (POST)        monotonic coupling
              Canvas + KaTeX  ←── JSON frames ←──────────────  returns history
```

The frontend fetches simulation data in **batches** (default 300 frames per
request). While batch _i_ is animating at 60 fps on the Canvas, batch _i + 1_
is pre-fetched asynchronously — ensuring smooth, stutter-free playback even on
large grids.

Each API call stays well within Vercel's **10-second serverless timeout**
thanks to an 8-second deadline guard in the Python code.

---

## Features

- **Dark / Light mode** — toggle in the header; persisted to `localStorage`.
- **Dashboard layout** — sidebar controls + central canvas + theory panel.
- **HTML5 Canvas visualiser** — grid, Top chain (blue), Bottom chain (red),
  sandwich area (purple), auto-scaling dots/lines for large grids.
- **Real-time convergence chart** — gap metric plotted live as the simulation
  progresses.
- **Metric toggle** — switch between _Area between paths_ and _Hamming distance_.
- **Speed slider** — 1× to 20× frames per animation tick.
- **Export buttons** — save the lattice plot or gap chart as PNG.
- **Loading states** — spinner while the first batch is fetched.
- **Mathematical context** — modal with KaTeX-rendered formulas explaining
  coupling, mixing time bounds, and the corner-flip Markov chain.
- **Responsive** — works on desktop and tablet.

---

## Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- npm (or pnpm / yarn)

### 1. Install frontend dependencies

```bash
cd random_surfaces
npm install
```

### 2. Install Python dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install flask
```

### 3. Run both servers

Open **two terminals**:

```bash
# Terminal 1 — Flask API (port 5328)
python api/index.py

# Terminal 2 — Next.js dev server (port 3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

> During local development, `next.config.mjs` proxies `/api/*` requests to
> `http://localhost:5328`, so both servers must be running.

---

## Deployment (Vercel)

### Option A — Git Push (recommended)

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "deploy"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com), import the repo.
3. Vercel auto-detects:
   - **Framework:** Next.js
   - **Python runtime:** `api/index.py` + `api/requirements.txt`
4. `vercel.json` handles the `/api/*` rewrite automatically.
5. Click **Deploy**.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel          # preview deploy
vercel --prod   # production deploy
```

---

## Project Structure (Web)

```
app/
  layout.tsx          Root layout (html, body, dark-mode class, KaTeX CSS)
  page.tsx            Main dashboard page
  globals.css         Tailwind directives + dark mode variables

components/
  SimCanvas.tsx       HTML5 Canvas — grid + paths + sandwich area
  GapChart.tsx        HTML5 Canvas — convergence line chart
  Controls.tsx        Sidebar: sliders, buttons, stats
  TheorySidebar.tsx   Collapsible theory + legend
  MathModal.tsx       Modal with KaTeX formulas
  ThemeToggle.tsx     Dark / light mode button

hooks/
  useSimulation.ts    Batch-fetch buffer system + animation loop
  useTheme.ts         Dark mode toggle + localStorage persistence

lib/
  types.ts            Shared TypeScript interfaces
  export.ts           Canvas-to-PNG download helper

api/
  index.py            Flask: POST /api/init + /api/batch
  requirements.txt    flask
```

---

## Configuration (Web)

All simulation parameters are controlled via the sidebar UI:

| Control    | Range  | Default | Description                        |
| ---------- | ------ | ------- | ---------------------------------- |
| N (width)  | 2–50   | 15      | Number of Right steps              |
| M (height) | 2–50   | 15      | Number of Up steps                 |
| Speed      | 1×–20× | 3×      | Animation frames per tick          |
| Gap Metric | —      | Area    | Area between paths / Hamming dist. |

---

## References

- **Course:** [Math Experimental Lab — Random Surfaces and Random Permutations](https://lpetrov.cc/mel-s26/)
- **Mentor:** [Leonid Petrov](https://lpetrov.cc/) (UVA Department of Mathematics)
- **GitHub:** <https://github.com/PiShrestha/random_surfaces>

---

## License

MIT — see [LICENSE](LICENSE).
