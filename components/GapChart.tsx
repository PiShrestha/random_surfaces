"use client";

import { useEffect, useRef } from "react";
import type { GapPoint, Metric } from "@/lib/types";

interface Props {
  data: GapPoint[];
  metric: Metric;
  /** changes every frame – used as a re-render trigger */
  trigger: number;
}

export default function GapChart({ data, metric, trigger }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = { top: 18, right: 16, bottom: 32, left: 52 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    if (data.length < 2) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Gap will appear here", W / 2, H / 2);
      return;
    }

    const maxStep = data[data.length - 1].step || 1;
    const maxGap = Math.max(...data.map((d) => d.gap)) || 1;

    const toX = (s: number) => pad.left + (s / maxStep) * plotW;
    const toY = (g: number) => pad.top + plotH - (g / maxGap) * plotH;

    // ── horizontal grid ─────────────────────────────────────────
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }

    // ── data line ───────────────────────────────────────────────
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = toX(data[i].step);
      const y = toY(data[i].gap);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ── axes ────────────────────────────────────────────────────
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, H - pad.bottom);
    ctx.lineTo(W - pad.right, H - pad.bottom);
    ctx.stroke();

    // ── tick labels ─────────────────────────────────────────────
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px system-ui, sans-serif";

    // x-axis
    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) {
      const s = Math.round((maxStep / 4) * i);
      const label = s >= 1000 ? `${(s / 1000).toFixed(1)}k` : String(s);
      ctx.fillText(label, toX(s), H - pad.bottom + 14);
    }

    // y-axis
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const g = Math.round((maxGap / 4) * (4 - i));
      ctx.fillText(String(g), pad.left - 6, pad.top + (plotH / 4) * i + 4);
    }

    // ── axis titles ─────────────────────────────────────────────
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MCMC step", pad.left + plotW / 2, H - 4);

    ctx.save();
    ctx.translate(12, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(metric === "area" ? "Area" : "Hamming dist.", 0, 0);
    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, metric]);

  return (
    <div ref={wrapRef} className="h-[180px] w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-lg border border-gray-200 bg-white"
      />
    </div>
  );
}
