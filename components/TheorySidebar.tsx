"use client";

import { useState } from "react";

export default function TheorySidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside className="space-y-4 text-sm leading-relaxed text-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-base font-semibold text-gray-900">Theory</h2>
        <span className="text-gray-400">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="space-y-4">
          {/* Lattice Paths */}
          <section>
            <h3 className="font-semibold text-gray-800">Lattice Paths</h3>
            <p>
              A <em>lattice path</em> on an N×M grid is a sequence of N
              &ldquo;Right&rdquo; and M &ldquo;Up&rdquo; steps from
              (0,&thinsp;0) to (N,&thinsp;M). The set of all such paths has{" "}
              <span className="font-mono text-xs">C(N+M, N)</span> elements.
            </p>
          </section>

          {/* Corner Flips */}
          <section>
            <h3 className="font-semibold text-gray-800">Corner Flips</h3>
            <p>
              At each step we choose a random adjacent pair in the path string.
              A <strong>directional corner flip</strong> only swaps in one
              direction:
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1">
              <li>
                <strong>UP:</strong> <code className="text-xs">RU → UR</code>{" "}
                (push the path higher)
              </li>
              <li>
                <strong>DOWN:</strong> <code className="text-xs">UR → RU</code>{" "}
                (push it lower)
              </li>
            </ul>
            <p className="mt-1">
              This makes the transition <em>monotone</em> — if path A ≥ path B
              before the flip, then A ≥ B afterwards.
            </p>
          </section>

          {/* Monotonic Coupling */}
          <section>
            <h3 className="font-semibold text-gray-800">Monotonic Coupling</h3>
            <p>
              We run <strong>two</strong> copies of the chain starting from the
              extremes — the highest path (all U then R) and the lowest (all R
              then U). Both chains see the <em>same</em> random index and
              direction at each step.
            </p>
            <p className="mt-1">
              Because the flip is monotone and both chains share randomness, the
              gap between them can only shrink. When the two paths become
              identical, they have <strong>coupled</strong>.
            </p>
          </section>

          {/* Mixing Time */}
          <section>
            <h3 className="font-semibold text-gray-800">Mixing Time Bound</h3>
            <p>
              The <em>coupling time</em> T<sub>couple</sub> is an upper bound on
              the total-variation mixing time of the chain:
            </p>
            <p className="mt-1 text-center font-mono text-xs">
              t<sub>mix</sub>(ε) ≤ E[T<sub>couple</sub>]
            </p>
            <p className="mt-1">
              For the N×M lattice-path chain, the mixing time scales as Θ(N²M²).
            </p>
          </section>

          {/* Area vs Hamming */}
          <section>
            <h3 className="font-semibold text-gray-800">Gap Metrics</h3>
            <p>
              <strong>Hamming distance</strong> counts positions where the two
              path strings differ. <strong>Area</strong> counts the number of
              unit squares enclosed between the two lattice paths — a more
              geometrically natural measure of how far apart the chains are.
            </p>
          </section>

          {/* Legend */}
          <section>
            <h3 className="font-semibold text-gray-800">Legend</h3>
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-5 rounded bg-blue-500" />
                <span>Top chain (starts high)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-5 rounded bg-red-500" />
                <span>Bottom chain (starts low)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-5 rounded bg-violet-400/30" />
                <span>Sandwich area (gap)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-5 rounded bg-emerald-500" />
                <span>Convergence curve</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
