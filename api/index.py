"""
Flask backend for the Random Surfaces web app.
Exposes two endpoints that run the monotonic coupling
algorithm in bounded batches (safe for Vercel's 10 s timeout).
"""

from flask import Flask, request, jsonify
import random
import time

app = Flask(__name__)

# ── lattice path helpers (same algorithm as random_paths.py) ─────────

def make_top_path(n, m):
    """Maximal path: all U's then all R's."""
    return "U" * m + "R" * n


def make_bot_path(n, m):
    """Minimal path: all R's then all U's."""
    return "R" * n + "U" * m


def hamming_distance(a, b):
    return sum(x != y for x, y in zip(a, b))


def area_between(top, bot):
    area, y_top, y_bot = 0, 0, 0
    for st, sb in zip(top, bot):
        if st == "R":
            area += y_top
        else:
            y_top += 1
        if sb == "R":
            area -= y_bot
        else:
            y_bot += 1
    return area


def compute_gap(top, bot, metric):
    return area_between(top, bot) if metric == "area" else hamming_distance(top, bot)


# ── endpoints ────────────────────────────────────────────────────────

@app.route("/api/init", methods=["POST"])
def init_endpoint():
    """
    POST /api/init
    Body: { n, m, metric }
    Returns the starting state of both chains.
    """
    data = request.get_json() or {}
    n = max(2, min(int(data.get("n", 10)), 50))
    m = max(2, min(int(data.get("m", 10)), 50))
    metric = data.get("metric", "area")

    top = make_top_path(n, m)
    bot = make_bot_path(n, m)
    gap = compute_gap(top, bot, metric)

    return jsonify({"top": top, "bot": bot, "gap": gap, "n": n, "m": m})


@app.route("/api/batch", methods=["POST"])
def batch_endpoint():
    """
    POST /api/batch
    Body: { top, bot, n, m, batch_size, sample_rate, metric }
    Runs `batch_size` MCMC steps, sampling the state every
    `sample_rate` steps.  Returns the frame history.
    """
    data = request.get_json()
    top_str = data["top"]
    bot_str = data["bot"]
    n = int(data["n"])
    m = int(data["m"])
    batch_size = min(int(data.get("batch_size", 500)), 20_000)
    sample_rate = max(1, int(data.get("sample_rate", 1)))
    metric = data.get("metric", "area")

    path_len = n + m
    top = list(top_str)
    bot = list(bot_str)

    history = []
    coupled = False
    steps_run = 0
    deadline = time.monotonic() + 8.0  # stay under Vercel 10 s limit

    for i in range(batch_size):
        k = random.randint(0, path_len - 2)
        d = random.randint(0, 1)

        if d == 1:  # UP
            if top[k] == "R" and top[k + 1] == "U":
                top[k], top[k + 1] = "U", "R"
            if bot[k] == "R" and bot[k + 1] == "U":
                bot[k], bot[k + 1] = "U", "R"
        else:  # DOWN
            if top[k] == "U" and top[k + 1] == "R":
                top[k], top[k + 1] = "R", "U"
            if bot[k] == "U" and bot[k + 1] == "R":
                bot[k], bot[k + 1] = "R", "U"

        steps_run += 1

        if top == bot:
            t, b = "".join(top), "".join(bot)
            history.append({"top": t, "bot": b, "gap": 0})
            coupled = True
            break

        if i % sample_rate == 0:
            t, b = "".join(top), "".join(bot)
            history.append({"top": t, "bot": b, "gap": compute_gap(t, b, metric)})

        # safety valve: don't exceed Vercel timeout
        if time.monotonic() > deadline:
            t, b = "".join(top), "".join(bot)
            history.append({"top": t, "bot": b, "gap": compute_gap(t, b, metric)})
            break

    return jsonify(
        {"history": history, "coupled": coupled, "steps_run": steps_run}
    )


# ── local dev server ─────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(port=5328, debug=False)
