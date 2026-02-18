"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BatchResponse,
  GapPoint,
  InitResponse,
  Metric,
  SimStatus,
  Step,
} from "@/lib/types";

/* ───────── adaptive batch parameters ────────────────────────────── */

const FRAMES_PER_BATCH = 300; // target frames returned per API call

function batchParams(n: number, m: number) {
  const sampleRate = Math.max(1, Math.floor((n * m) / 100));
  const batchSize = FRAMES_PER_BATCH * sampleRate;
  return { batchSize, sampleRate };
}

/* ───────── state shape ──────────────────────────────────────────── */

interface SimState {
  status: SimStatus;
  frame: Step | null;
  totalSteps: number;
  mixingTime: number | null;
}

const INITIAL: SimState = {
  status: "idle",
  frame: null,
  totalSteps: 0,
  mixingTime: null,
};

/* ───────── hook ─────────────────────────────────────────────────── */

export function useSimulation(
  n: number,
  m: number,
  metric: Metric,
  speed: number, // frames to advance per rAF tick (1–20)
) {
  const [sim, setSim] = useState<SimState>(INITIAL);

  // mutable refs – drive the animation loop without re-renders
  const statusRef = useRef<SimStatus>("idle");
  const buffer = useRef<Step[]>([]);
  const nextBuffer = useRef<Step[] | null>(null);
  const fIdx = useRef(0);
  const steps = useRef(0);
  const gapH = useRef<GapPoint[]>([]);
  const pathState = useRef<{ top: string; bot: string } | null>(null);
  const fetching = useRef(false);
  const coupled = useRef(false);
  const raf = useRef(0);
  const speedRef = useRef(speed);
  const configRef = useRef({ n, m, metric });

  // keep refs in sync with latest props
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    configRef.current = { n, m, metric };
  }, [n, m, metric]);

  /* ── API helpers ─────────────────────────────────────────────── */

  const apiFetch = useCallback(
    async <T>(url: string, body: object): Promise<T> => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`API ${url} → HTTP ${res.status}`);
      return res.json() as Promise<T>;
    },
    [],
  );

  const fetchBatch = useCallback(async () => {
    if (!pathState.current || coupled.current || fetching.current) return;
    fetching.current = true;
    try {
      const { n, m, metric } = configRef.current;
      const { batchSize, sampleRate } = batchParams(n, m);
      const data = await apiFetch<BatchResponse>("/api/batch", {
        ...pathState.current,
        n,
        m,
        metric,
        batch_size: batchSize,
        sample_rate: sampleRate,
      });
      if (data.history.length > 0) {
        const last = data.history[data.history.length - 1];
        pathState.current = { top: last.top, bot: last.bot };
        nextBuffer.current = data.history;
        if (data.coupled) coupled.current = true;
      }
    } catch (err) {
      console.error("batch fetch failed", err);
    }
    fetching.current = false;
  }, [apiFetch]);

  /* ── animation loop ──────────────────────────────────────────── */

  const tick = useCallback(() => {
    if (statusRef.current !== "running") return;

    let latest: Step | null = null;
    const { sampleRate } = batchParams(
      configRef.current.n,
      configRef.current.m,
    );

    for (let i = 0; i < speedRef.current; i++) {
      // swap buffers when the current one is exhausted
      if (fIdx.current >= buffer.current.length) {
        if (nextBuffer.current) {
          buffer.current = nextBuffer.current;
          nextBuffer.current = null;
          fIdx.current = 0;
          if (!coupled.current) fetchBatch();
        } else {
          break; // buffer underrun – wait for fetch
        }
      }
      if (fIdx.current < buffer.current.length) {
        latest = buffer.current[fIdx.current++];
        steps.current += sampleRate;
        gapH.current.push({ step: steps.current, gap: latest.gap });
      }
    }

    if (latest) {
      const done = latest.gap === 0;
      statusRef.current = done ? "coupled" : "running";
      setSim({
        status: done ? "coupled" : "running",
        frame: latest,
        totalSteps: steps.current,
        mixingTime: done ? steps.current : null,
      });
      if (done) return;
    }

    raf.current = requestAnimationFrame(tick);
  }, [fetchBatch]);

  /* ── public controls ─────────────────────────────────────────── */

  const start = useCallback(async () => {
    // reset internal state
    cancelAnimationFrame(raf.current);
    buffer.current = [];
    nextBuffer.current = null;
    fIdx.current = 0;
    steps.current = 0;
    coupled.current = false;
    gapH.current = [];
    fetching.current = false;

    const { n, m, metric } = configRef.current;
    const data = await apiFetch<InitResponse>("/api/init", { n, m, metric });

    pathState.current = { top: data.top, bot: data.bot };
    gapH.current = [{ step: 0, gap: data.gap }];

    setSim({
      status: "running",
      frame: { top: data.top, bot: data.bot, gap: data.gap },
      totalSteps: 0,
      mixingTime: null,
    });
    statusRef.current = "running";

    // fetch first batch, then kick off animation
    await fetchBatch();
    if (nextBuffer.current) {
      buffer.current = nextBuffer.current;
      nextBuffer.current = null;
      fIdx.current = 0;
      if (!coupled.current) fetchBatch(); // pre-fetch batch 2
    }
    raf.current = requestAnimationFrame(tick);
  }, [apiFetch, fetchBatch, tick]);

  const pause = useCallback(() => {
    cancelAnimationFrame(raf.current);
    statusRef.current = "paused";
    setSim((prev) => ({ ...prev, status: "paused" }));
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    statusRef.current = "running";
    setSim((prev) => ({ ...prev, status: "running" }));
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current);
    statusRef.current = "idle";
    buffer.current = [];
    nextBuffer.current = null;
    fIdx.current = 0;
    steps.current = 0;
    coupled.current = false;
    gapH.current = [];
    pathState.current = null;
    fetching.current = false;
    setSim(INITIAL);
  }, []);

  // clean up on unmount
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return {
    ...sim,
    gapHistory: gapH.current,
    start,
    pause,
    resume,
    reset,
  };
}
