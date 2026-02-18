"use client";

import { useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import SimCanvas from "@/components/SimCanvas";
import GapChart from "@/components/GapChart";
import Controls from "@/components/Controls";
import TheorySidebar from "@/components/TheorySidebar";
import type { Metric } from "@/lib/types";

export default function Home() {
  const [n, setN] = useState(15);
  const [m, setM] = useState(15);
  const [metric, setMetric] = useState<Metric>("area");
  const [speed, setSpeed] = useState(3);

  const sim = useSimulation(n, m, metric, speed);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
      {/* ── header ──────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold tracking-tight text-gray-900">
          Random Surfaces{" "}
          <span className="font-normal text-gray-400">
            — Monotonic Coupling Simulator
          </span>
        </h1>
      </header>

      {/* ── body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        {/* Left: controls */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
              ✓ Chains coupled! &ensp;Mixing time ={" "}
              <span className="tabular-nums">
                {sim.mixingTime?.toLocaleString()}
              </span>{" "}
              steps
            </div>
          )}

          {/* lattice canvas */}
          <div className="mx-auto w-full max-w-[560px]">
            <SimCanvas n={n} m={m} frame={sim.frame} />
          </div>

          {/* gap chart */}
          <div className="w-full">
            <GapChart
              data={sim.gapHistory}
              metric={metric}
              trigger={sim.totalSteps}
            />
          </div>
        </div>

        {/* Right: theory sidebar */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <TheorySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
