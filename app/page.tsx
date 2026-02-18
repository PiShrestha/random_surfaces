"use client";

import { useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import { useTheme } from "@/hooks/useTheme";
import SimCanvas from "@/components/SimCanvas";
import GapChart from "@/components/GapChart";
import Controls from "@/components/Controls";
import TheorySidebar from "@/components/TheorySidebar";
import ThemeToggle from "@/components/ThemeToggle";
import MathModal from "@/components/MathModal";
import type { Metric } from "@/lib/types";

export default function Home() {
  const [n, setN] = useState(15);
  const [m, setM] = useState(15);
  const [metric, setMetric] = useState<Metric>("area");
  const [speed, setSpeed] = useState(3);
  const { theme, toggle: toggleTheme } = useTheme();

  const sim = useSimulation(n, m, metric, speed);

  const loading = sim.status === "running" && sim.totalSteps === 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
      {/* ── header ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Random Surfaces
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <a
              href="https://lpetrov.cc/mel-s26/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              UVA Math Experimental Lab
            </a>{" "}
            - Monotonic Coupling Simulator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MathModal />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <a
            href="https://github.com/PiShrestha/random_surfaces"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        {/* Left: controls */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <Controls
              n={n}
              m={m}
              metric={metric}
              speed={speed}
              status={sim.status}
              totalSteps={sim.totalSteps}
              mixingTime={sim.mixingTime}
              onN={setN}
              onM={setM}
              onMetric={setMetric}
              onSpeed={setSpeed}
              onStart={sim.start}
              onPause={sim.pause}
              onResume={sim.resume}
              onReset={sim.reset}
            />
          </div>
        </div>

        {/* Centre: visualisations */}
        <div className="flex flex-1 flex-col gap-4">
          {/* coupled banner */}
          {sim.status === "coupled" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              ✓ Chains coupled! &ensp;Mixing time ={" "}
              <span className="tabular-nums">
                {sim.mixingTime?.toLocaleString()}
              </span>{" "}
              steps
            </div>
          )}

          {/* loading spinner */}
          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
              Calculating surface...
            </div>
          )}

          {/* lattice canvas */}
          <div className="mx-auto w-full max-w-[560px]">
            <SimCanvas
              n={n}
              m={m}
              frame={sim.frame}
              loading={loading}
              theme={theme}
            />
          </div>

          {/* gap chart */}
          <div className="w-full">
            <GapChart
              data={sim.gapHistory}
              metric={metric}
              trigger={sim.totalSteps}
              theme={theme}
            />
          </div>
        </div>

        {/* Right: theory sidebar */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <TheorySidebar />
          </div>
        </div>
      </div>

      {/* ── footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-3 text-center text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
        <a
          href="https://lpetrov.cc/mel-s26/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Math Experimental Lab: Random Surfaces &amp; Random Permutations
        </a>{" "}
        - UVA Spring 2026 - Mentored by{" "}
        <a
          href="https://lpetrov.cc/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Leonid Petrov
        </a>
      </footer>
    </div>
  );
}
