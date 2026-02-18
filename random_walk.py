import random
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# -----------------------------
# Settings you can tweak
# -----------------------------
N = 30                 # grid width  (number of 'R' steps)
M = 30                 # grid height (number of 'U' steps)
SNAPSHOT_INTERVAL = 3000  # record a frame every this many steps
MAX_STEPS = 300_000       # stop if not coupled by this many steps
ANIM_INTERVAL_MS = 120    # milliseconds between frames
BLIT = False              # blitting can be fragile on some backends; False is safer
REPEAT = False            # True to loop the animation; False to sit on the final frame


# -----------------------------
# Path helpers
# -----------------------------
def make_top_path(n, m):
    # All U's first, then all R's (maximal / "high" path)
    return ['U'] * m + ['R'] * n

def make_bot_path(n, m):
    # All R's first, then all U's (minimal / "low" path)
    return ['R'] * n + ['U'] * m

def path_to_coords(path):
    """Convert a path like ['R','U',...] into (xs, ys) coordinates."""
    x, y = 0, 0
    xs, ys = [0], [0]
    for step in path:
        if step == 'R':
            x += 1
        else:
            y += 1
        xs.append(x)
        ys.append(y)
    return xs, ys

def corner_flip(path, k, direction):
    """
    direction = 1 (UP):   RU -> UR
    direction = 0 (DOWN): UR -> RU
    else do nothing (self-loop)
    """
    if direction == 1:  # try to push up
        if path[k] == 'R' and path[k + 1] == 'U':
            path[k], path[k + 1] = 'U', 'R'
    else:  # try to push down
        if path[k] == 'U' and path[k + 1] == 'R':
            path[k], path[k + 1] = 'R', 'U'

def hamming_distance(a, b):
    return sum(x != y for x, y in zip(a, b))


# -----------------------------
# Simulators
# -----------------------------
def run_coupled(n, m, snapshot_interval=SNAPSHOT_INTERVAL, max_steps=MAX_STEPS):
    """
    Monotone coupling: both chains use the SAME (k, direction).
    """
    path_top = make_top_path(n, m)
    path_bot = make_bot_path(n, m)
    path_len = n + m

    t = 0
    snapshots = [(0, path_to_coords(path_top), path_to_coords(path_bot))]
    gap_history = [(0, hamming_distance(path_top, path_bot))]

    while path_top != path_bot and t < max_steps:
        k = random.randint(0, path_len - 2)
        direction = random.randint(0, 1)

        corner_flip(path_top, k, direction)
        corner_flip(path_bot, k, direction)

        t += 1
        if t % snapshot_interval == 0:
            snapshots.append((t, path_to_coords(path_top), path_to_coords(path_bot)))
            gap_history.append((t, hamming_distance(path_top, path_bot)))

    # final record
    snapshots.append((t, path_to_coords(path_top), path_to_coords(path_bot)))
    gap_history.append((t, hamming_distance(path_top, path_bot)))

    coupled = (path_top == path_bot)
    return t, snapshots, gap_history, coupled

def run_uncoupled(n, m, snapshot_interval=SNAPSHOT_INTERVAL, max_steps=MAX_STEPS):
    """
    UNCOUPLED: each chain chooses its own independent (k, direction) each step.
    """
    path_top = make_top_path(n, m)
    path_bot = make_bot_path(n, m)
    path_len = n + m

    t = 0
    snapshots = [(0, path_to_coords(path_top), path_to_coords(path_bot))]
    gap_history = [(0, hamming_distance(path_top, path_bot))]

    while path_top != path_bot and t < max_steps:
        # independent randomness for top
        k_top = random.randint(0, path_len - 2)
        dir_top = random.randint(0, 1)
        corner_flip(path_top, k_top, dir_top)

        # independent randomness for bottom
        k_bot = random.randint(0, path_len - 2)
        dir_bot = random.randint(0, 1)
        corner_flip(path_bot, k_bot, dir_bot)

        t += 1
        if t % snapshot_interval == 0:
            snapshots.append((t, path_to_coords(path_top), path_to_coords(path_bot)))
            gap_history.append((t, hamming_distance(path_top, path_bot)))

    # final record
    snapshots.append((t, path_to_coords(path_top), path_to_coords(path_bot)))
    gap_history.append((t, hamming_distance(path_top, path_bot)))

    coupled = (path_top == path_bot)
    return t, snapshots, gap_history, coupled


# -----------------------------
# Dashboard animation: 3 panels
#   1) Coupled grid
#   2) Uncoupled grid
#   3) Gap comparison (both curves)
# -----------------------------
def animate_dashboard(c_demo, u_demo, n, m):
    (t_c, snaps_c, gap_c, coupled_c) = c_demo
    (t_u, snaps_u, gap_u, coupled_u) = u_demo

    fig, axes = plt.subplots(1, 3, figsize=(18, 6), gridspec_kw={'width_ratios': [1, 1, 1]})
    ax_c, ax_u, ax_gap = axes

    # marker/line scaling
    grid_max = max(n, m)
    ms = max(1, 6 - grid_max // 20)
    lw = max(0.6, 2.0 - grid_max / 80)

    # --- Coupled grid ---
    ax_c.set_xlim(-0.5, n + 0.5)
    ax_c.set_ylim(-0.5, m + 0.5)
    ax_c.set_aspect('equal')
    ax_c.grid(True, linewidth=0.3, alpha=0.5)
    ax_c.set_title("Coupled (shared randomness)")
    ax_c.set_xlabel("Right steps")
    ax_c.set_ylabel("Up steps")

    c_top_line, = ax_c.plot([], [], 'o-', markersize=ms, linewidth=lw, label='Top')
    c_bot_line, = ax_c.plot([], [], 'o-', markersize=ms, linewidth=lw, label='Bottom')
    ax_c.legend(fontsize=8, loc='upper left')

    c_status = ax_c.text(
        0.98, 0.02, '', transform=ax_c.transAxes,
        ha='right', va='bottom', fontsize=10,
        bbox=dict(boxstyle='round,pad=0.3', fc='white', alpha=0.8)
    )

    # --- Uncoupled grid ---
    ax_u.set_xlim(-0.5, n + 0.5)
    ax_u.set_ylim(-0.5, m + 0.5)
    ax_u.set_aspect('equal')
    ax_u.grid(True, linewidth=0.3, alpha=0.5)
    ax_u.set_title("Uncoupled (independent randomness)")
    ax_u.set_xlabel("Right steps")
    ax_u.set_ylabel("Up steps")

    u_top_line, = ax_u.plot([], [], 'o-', markersize=ms, linewidth=lw, label='Top')
    u_bot_line, = ax_u.plot([], [], 'o-', markersize=ms, linewidth=lw, label='Bottom')
    ax_u.legend(fontsize=8, loc='upper left')

    u_status = ax_u.text(
        0.98, 0.02, '', transform=ax_u.transAxes,
        ha='right', va='bottom', fontsize=10,
        bbox=dict(boxstyle='round,pad=0.3', fc='white', alpha=0.8)
    )

    # --- Gap comparison ---
    steps_c = [s for s, _ in gap_c]
    vals_c  = [g for _, g in gap_c]
    steps_u = [s for s, _ in gap_u]
    vals_u  = [g for _, g in gap_u]

    max_x = max(steps_c[-1] if steps_c else 1, steps_u[-1] if steps_u else 1)
    max_y = max(max(vals_c) if vals_c else 1, max(vals_u) if vals_u else 1)

    ax_gap.set_xlim(0, max_x * 1.05)
    ax_gap.set_ylim(0, max_y * 1.1)
    ax_gap.grid(True, linewidth=0.3, alpha=0.5)
    ax_gap.set_title("Gap comparison (Hamming distance)")
    ax_gap.set_xlabel("MCMC step")
    ax_gap.set_ylabel("Hamming distance")

    gap_line_c, = ax_gap.plot([], [], '-', linewidth=1.5, label='Coupled')
    gap_line_u, = ax_gap.plot([], [], '-', linewidth=1.5, label='Uncoupled')
    ax_gap.legend(fontsize=8, loc='upper right')

    # frames: advance by snapshot index, hold last snapshot when one ends
    total_frames = max(len(snaps_c), len(snaps_u))

    def init():
        c_top_line.set_data([], [])
        c_bot_line.set_data([], [])
        u_top_line.set_data([], [])
        u_bot_line.set_data([], [])
        gap_line_c.set_data([], [])
        gap_line_u.set_data([], [])
        c_status.set_text('')
        u_status.set_text('')
        return (c_top_line, c_bot_line, u_top_line, u_bot_line,
                gap_line_c, gap_line_u, c_status, u_status)

    def update(frame_idx):
        # --- coupled snapshot ---
        idx_c = min(frame_idx, len(snaps_c) - 1)
        step_c, (ctx, cty), (cbx, cby) = snaps_c[idx_c]
        c_top_line.set_data(ctx, cty)
        c_bot_line.set_data(cbx, cby)

        if idx_c < len(snaps_c) - 1:
            c_status.set_text(f"step {step_c:,}")
        else:
            icon = 'OK' if coupled_c else 'END'
            c_status.set_text(f"{icon} at {t_c:,}")

        # --- uncoupled snapshot ---
        idx_u = min(frame_idx, len(snaps_u) - 1)
        step_u, (utx, uty), (ubx, uby) = snaps_u[idx_u]
        u_top_line.set_data(utx, uty)
        u_bot_line.set_data(ubx, uby)

        if idx_u < len(snaps_u) - 1:
            u_status.set_text(f"step {step_u:,}")
        else:
            icon = 'OK' if coupled_u else 'END'
            u_status.set_text(f"{icon} at {t_u:,}")

        # --- gap lines up to the same snapshot index (they align with snapshot recording) ---
        gid_c = min(idx_c, len(steps_c) - 1)
        gid_u = min(idx_u, len(steps_u) - 1)
        gap_line_c.set_data(steps_c[:gid_c + 1], vals_c[:gid_c + 1])
        gap_line_u.set_data(steps_u[:gid_u + 1], vals_u[:gid_u + 1])

        return (c_top_line, c_bot_line, u_top_line, u_bot_line,
                gap_line_c, gap_line_u, c_status, u_status)

    anim = FuncAnimation(
        fig, update, frames=total_frames,
        init_func=init, interval=ANIM_INTERVAL_MS,
        blit=BLIT, repeat=REPEAT,
    )
    plt.tight_layout()
    plt.show()
    return anim


# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    print(f"Grid size: {N} × {M}")
    print(f"Path length: {N + M} steps")
    print(f"Snapshot interval: {SNAPSHOT_INTERVAL}")
    print(f"Max steps: {MAX_STEPS}\n")

    print("Running COUPLED demo...")
    c_demo = run_coupled(N, M, SNAPSHOT_INTERVAL, MAX_STEPS)
    print(f"  Coupled? {c_demo[3]} | End time: {c_demo[0]:,} | Snapshots: {len(c_demo[1])}")

    print("Running UNCOUPLED demo...")
    u_demo = run_uncoupled(N, M, SNAPSHOT_INTERVAL, MAX_STEPS)
    print(f"  Coupled? {u_demo[3]} | End time: {u_demo[0]:,} | Snapshots: {len(u_demo[1])}\n")

    # One window: 3 panels (coupled grid, uncoupled grid, gap comparison)
    anim = animate_dashboard(c_demo, u_demo, N, M)
