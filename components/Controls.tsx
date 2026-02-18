"use client";

import type { Metric, SimStatus } from "@/lib/types";

interface Props {
  n: number;
  m: number;
  metric: Metric;
  speed: number;
  status: SimStatus;
  totalSteps: number;
  mixingTime: number | null;
  onN: (v: number) => void;
  onM: (v: number) => void;
  onMetric: (v: Metric) => void;
  onSpeed: (v: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export default function Controls(props: Props) {
  const {
    n,
    m,
    metric,
    speed,
    status,
    totalSteps,
    mixingTime,
    onN,
    onM,
    onMetric,
    onSpeed,
    onStart,
    onPause,
    onResume,
    onReset,
  } = props;

  const running = status === "running";
  const paused = status === "paused";
  const idle = status === "idle";
  const done = status === "coupled";

  return (
    <div className="space-y-5">
      {/* ── Grid size ─────────────────────────────────────────── */}
      <fieldset disabled={running || paused} className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Grid Size
        </legend>

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            N (width)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={2}
              max={50}
              value={n}
              onChange={(e) => onN(+e.target.value)}
              className="h-1.5 w-28 accent-indigo-600"
            />
            <span className="w-7 text-right text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
              {n}
            </span>
          </div>
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            M (height)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={2}
              max={50}
              value={m}
              onChange={(e) => onM(+e.target.value)}
              className="h-1.5 w-28 accent-indigo-600"
            />
            <span className="w-7 text-right text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
              {m}
            </span>
          </div>
        </label>
      </fieldset>

      {/* ── Metric toggle ─────────────────────────────────────── */}
      <fieldset disabled={running || paused} className="space-y-1">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Gap Metric
        </legend>
        <div className="mt-1 flex rounded-lg border border-gray-200 text-sm dark:border-gray-600">
          {(["area", "hamming"] as Metric[]).map((v) => (
            <button
              key={v}
              onClick={() => onMetric(v)}
              className={`flex-1 px-3 py-1.5 transition-colors first:rounded-l-lg last:rounded-r-lg ${
                metric === v
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {v === "area" ? "Area" : "Hamming"}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── Speed ─────────────────────────────────────────────── */}
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Speed&ensp;×{speed}
        </span>
        <input
          type="range"
          min={1}
          max={20}
          value={speed}
          onChange={(e) => onSpeed(+e.target.value)}
          className="h-1.5 w-full accent-indigo-600"
        />
      </label>

      {/* ── Buttons ───────────────────────────────────────────── */}
      <div className="flex gap-2">
        {idle || done ? (
          <button
            onClick={onStart}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            {done ? "Restart" : "Start"}
          </button>
        ) : running ? (
          <button
            onClick={onPause}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Resume
          </button>
        )}
        <button
          onClick={onReset}
          disabled={idle}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Status</span>
          <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
            {status === "running" && (
              <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            )}
            {status}
          </span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">MCMC Steps</span>
          <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">
            {totalSteps.toLocaleString()}
          </span>
        </div>
        {mixingTime !== null && (
          <div className="mt-1 flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Mixing Time
            </span>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {mixingTime.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
