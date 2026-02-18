"use client";

import { useState } from "react";
import KTeX from "./KTeX";

export default function TheorySidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Theory
        </h2>
        <span className="text-gray-400">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="space-y-4">
          {/* About */}
          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              About
            </h3>
            <p>
              Part of the{" "}
              <a
                href="https://lpetrov.cc/mel-s26/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 underline decoration-indigo-300 dark:text-indigo-400 dark:decoration-indigo-600"
              >
                Math Experimental Lab
              </a>{" "}
              at UVA (Spring 2026), mentored by{" "}
              <a
                href="https://lpetrov.cc/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 underline decoration-indigo-300 dark:text-indigo-400 dark:decoration-indigo-600"
              >
                Leonid Petrov
              </a>
              . We study random 3-D stepped surfaces arising from stacking unit
              cubes in a corner — their cross-sections are lattice paths.
            </p>
          </section>

          {/* Lattice Paths */}
          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Lattice Paths
            </h3>
            <p>
              A path on an N×M grid is a sequence of N &ldquo;Right&rdquo; and M
              &ldquo;Up&rdquo; steps. The total number of such paths is{" "}
              <KTeX tex="\binom{N{+}M}{N}" />.
            </p>
          </section>

          {/* Corner Flips */}
          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Corner Flips
            </h3>
            <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1">
              <li>
                <strong>UP:</strong> <KTeX tex="\texttt{RU} \to \texttt{UR}" />
              </li>
              <li>
                <strong>DOWN:</strong>{" "}
                <KTeX tex="\texttt{UR} \to \texttt{RU}" />
              </li>
            </ul>
            <p className="mt-1">
              This is <em>monotone</em>: if <KTeX tex="A \ge B" /> before, then{" "}
              <KTeX tex="A \ge B" /> after.
            </p>
          </section>

          {/* Coupling */}
          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Coupling Bound
            </h3>
            <p>
              Two chains from extremes with shared randomness couple in time{" "}
              <KTeX tex="T_{\text{couple}}" />, giving:
            </p>
            <div className="my-1.5 text-center">
              <KTeX
                tex="t_{\text{mix}}(\varepsilon) \le \mathbb{E}[T_{\text{couple}}]"
                display
              />
            </div>
            <p>
              Scaling: <KTeX tex="\Theta(N^2 M^2)" />
            </p>
          </section>

          {/* Metrics */}
          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Gap Metrics
            </h3>
            <p>
              <strong>Hamming:</strong> positions where path strings differ.
              <br />
              <strong>Area:</strong> unit squares enclosed between paths.
            </p>
          </section>

          {/* Legend */}
          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Legend
            </h3>
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
                <span className="inline-block h-2.5 w-5 rounded bg-violet-400/30 dark:bg-violet-400/40" />
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
