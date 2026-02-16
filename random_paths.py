import random
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

N = 100                # grid width  (number of 'R' steps)
M = 100                # grid height (number of 'U' steps)
SNAPSHOT_INTERVAL = 5000  # save a frame every this many steps (for animation)


def make_top_path(n, m):
    # All U's first, then all R's -> X
    return ['U'] * m + ['R'] * n

def make_bot_path(n, m):
    # All R's first, then all U's -> Y
    return ['R'] * n + ['U'] * m


def path_to_coords(path):
    """Convert a path list like ['R','U','R',...] into (xs, ys) coordinates."""
    x, y = 0, 0
    xs, ys = [0], [0]
    for step in path:
        if step == 'R':
            x += 1
        else: # 'U'
            y += 1
        xs.append(x)
        ys.append(y)
    return xs, ys


def corner_flip(path, k, direction):
    """
    path      : list of 'R'/'U'
    k         : index in [0, len(path)-2]
    direction : 1 (UP) or 0 (DOWN)

    Rules:
        direction = 1  (UP)  : if path[k:k+2] == ['R','U'] -> swap to ['U','R']
        direction = 0  (DOWN): if path[k:k+2] == ['U','R'] -> swap to ['R','U']
        Otherwise            : do nothing  (a self-loop).
    """
    if direction == 1: # try to push path UP
        if path[k] == 'R' and path[k + 1] == 'U':
            path[k], path[k + 1] = 'U', 'R'
    else: # try to push path DOWN
        if path[k] == 'U' and path[k + 1] == 'R':
            path[k], path[k + 1] = 'R', 'U'



def hamming_distance(a, b):
    # count positions where the two paths differ
    return sum(x != y for x, y in zip(a, b))


def run_coupling(n, m, snapshot_interval=SNAPSHOT_INTERVAL):
    # run the monotonic coupling until the two extreme chains meet.
    path_top = make_top_path(n, m)
    path_bot = make_bot_path(n, m)
    path_len = n + m  # total length of every path

    mixing_time = 0
    snapshots = []
    gap_history = []

    snapshots.append((0, path_to_coords(path_top), path_to_coords(path_bot)))
    gap_history.append((0, hamming_distance(path_top, path_bot)))

    while path_top != path_bot:
        # draw the SAME (k, direction) for both chains 
        # Sharing the randomness is what forces the chains to couple.
        k         = random.randint(0, path_len - 2)
        direction = random.randint(0, 1) # 0 = DOWN, 1 = UP

        corner_flip(path_top, k, direction)
        corner_flip(path_bot, k, direction)

        mixing_time += 1

        # Periodically record a snapshot for the animation
        if mixing_time % snapshot_interval == 0:
            snapshots.append(
                (mixing_time,
                 path_to_coords(path_top),
                 path_to_coords(path_bot))
            )
            gap_history.append(
                (mixing_time, hamming_distance(path_top, path_bot))
            )

    # Always record the final (coupled) state
    snapshots.append(
        (mixing_time, path_to_coords(path_top), path_to_coords(path_bot))
    )
    gap_history.append((mixing_time, 0))

    return mixing_time, snapshots, gap_history


def animate_coupling(snapshots, n, m, mixing_time, gap_history):
    """
    Build a matplotlib animation with two panels:
      • Left  — the lattice showing both paths converging.
      • Right — a live plot of the Hamming-distance gap over time.
    """
    fig, (ax_path, ax_gap) = plt.subplots(
        1, 2, figsize=(13, 6),
        gridspec_kw={'width_ratios': [1, 1]},
    )

    # Scale markers and line width for large grids
    grid_max = max(n, m)
    ms = max(1, 6 - grid_max // 20)
    lw = max(0.6, 2.0 - grid_max / 80)

    # -- Left panel: lattice paths --
    ax_path.set_xlim(-0.5, n + 0.5)
    ax_path.set_ylim(-0.5, m + 0.5)
    ax_path.set_aspect('equal')
    ax_path.grid(True, linewidth=0.3, alpha=0.5)
    ax_path.set_xlabel('Right steps')
    ax_path.set_ylabel('Up steps')

    line_top, = ax_path.plot([], [], 'o-', color='#e63946', markersize=ms,
                             linewidth=lw, label='Top chain (starts high)')
    line_bot, = ax_path.plot([], [], 'o-', color='#457b9d', markersize=ms,
                             linewidth=lw, label='Bottom chain (starts low)')
    ax_path.legend(loc='upper left', fontsize=9)
    ax_path.set_title('Monotonic Coupling')

    # Status text inside the axes (redraws cleanly, unlike the axes title
    # which gets garbled when blit=True)
    status_text = ax_path.text(
        0.98, 0.02, '', transform=ax_path.transAxes,
        ha='right', va='bottom', fontsize=10,
        bbox=dict(boxstyle='round,pad=0.3', fc='white', alpha=0.8),
    )

    # -- Right panel: convergence gap --
    gap_steps = [s for s, _ in gap_history]
    gap_vals  = [g for _, g in gap_history]
    ax_gap.set_xlim(0, max(gap_steps) * 1.05 if gap_steps else 1)
    ax_gap.set_ylim(0, max(gap_vals) * 1.1 if gap_vals else 1)
    ax_gap.set_xlabel('MCMC step')
    ax_gap.set_ylabel('Number of positions two paths differ)')
    ax_gap.set_title('Convergence of the coupling gap')
    ax_gap.grid(True, linewidth=0.3, alpha=0.5)
    gap_line, = ax_gap.plot([], [], '-', color='#2a9d8f', linewidth=1.5)

    def init():
        line_top.set_data([], [])
        line_bot.set_data([], [])
        gap_line.set_data([], [])
        status_text.set_text('')
        return line_top, line_bot, gap_line, status_text

    def update(frame_idx):
        # Update lattice paths
        step, (tx, ty), (bx, by) = snapshots[frame_idx]
        line_top.set_data(tx, ty)
        line_bot.set_data(bx, by)

        if step < mixing_time:
            status_text.set_text(f'step {step:,}')
        else:
            status_text.set_text(
                f'\u2713 Coupled!  mixing time = {mixing_time:,}'
            )

        # Update gap plot (show history up to current frame)
        idx = min(frame_idx, len(gap_steps) - 1)
        gap_line.set_data(gap_steps[:idx + 1], gap_vals[:idx + 1])

        return line_top, line_bot, gap_line, status_text

    anim = FuncAnimation(
        fig,
        update,
        frames=len(snapshots),
        init_func=init,
        interval=120, # milliseconds between frames
        blit=True,
        repeat=False,
    )

    plt.tight_layout()
    plt.show()
    return anim  # keep a reference so the animation isn't garbage-collected


def plot_final_state(snapshots, n, m, mixing_time, gap_history):
    """
    Static summary: three lattice snapshots (start / midway / coupled)
    plus a Hamming-distance convergence curve.
    """
    indices = [0, len(snapshots) // 2, len(snapshots) - 1]
    labels  = ['Start', 'Midway', f'Coupled (t={mixing_time:,})']

    # Scale markers and line width for large grids
    grid_max = max(n, m)
    ms = max(1, 6 - grid_max // 20)
    lw = max(0.6, 2.0 - grid_max / 80)

    fig, axes = plt.subplots(1, 4, figsize=(20, 5),
                             gridspec_kw={'width_ratios': [1, 1, 1, 1.3]})

    # Three lattice snapshots
    for ax, idx, label in zip(axes[:3], indices, labels):
        step, (tx, ty), (bx, by) = snapshots[idx]
        ax.plot(tx, ty, 'o-', color='#e63946', markersize=ms,
                linewidth=lw, label='Top chain')
        ax.plot(bx, by, 'o-', color='#457b9d', markersize=ms,
                linewidth=lw, label='Bottom chain')
        ax.set_xlim(-0.5, n + 0.5)
        ax.set_ylim(-0.5, m + 0.5)
        ax.set_aspect('equal')
        ax.grid(True, linewidth=0.3, alpha=0.5)
        ax.set_title(f'{label}  (step {step:,})', fontsize=11)
        ax.legend(fontsize=8)

    # Convergence curve
    ax_gap = axes[3]
    gap_steps = [s for s, _ in gap_history]
    gap_vals  = [g for _, g in gap_history]
    ax_gap.plot(gap_steps, gap_vals, '-', color='#2a9d8f', linewidth=1.5)
    ax_gap.set_xlabel('MCMC step')
    ax_gap.set_ylabel('Hamming distance')
    ax_gap.set_title('Coupling gap over time')
    ax_gap.grid(True, linewidth=0.3, alpha=0.5)

    fig.suptitle(
        f'Monotonic Coupling on a {n}×{m} Lattice  |  '
        f'Mixing Time = {mixing_time:,} steps',
        fontsize=13, fontweight='bold',
    )
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    print(f'Grid size : {N} × {M}')
    print(f'Path length: {N + M} steps ({N} Rights, {M} Ups)\n')

    print('Running monotonic coupling …')
    mixing_time, snapshots, gap_history = run_coupling(N, M)

    print(f'\n Chains coupled after {mixing_time:,} steps.')
    print(f'   ({len(snapshots)} snapshots recorded for visualisation)\n')

    # Show the animation (interactive) + the static summary
    anim = animate_coupling(snapshots, N, M, mixing_time, gap_history)
    plot_final_state(snapshots, N, M, mixing_time, gap_history)