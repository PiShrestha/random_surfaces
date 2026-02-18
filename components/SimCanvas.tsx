"use client";

import { useEffect, useRef } from "react";
import type { Step } from "@/lib/types";

/* ── helpers ─────────────────────────────────────────────────────── */

function pathToCoords(path: string): [number, number][] {
  let x = 0,
    y = 0;
  const coords: [number, number][] = [[0, 0]];
  for (const ch of path) {
    if (ch === "R") x++;
    else y++;
    coords.push([x, y]);
  }
  return coords;
}

/* ── component ───────────────────────────────────────────────────── */

interface Props {
  n: number;
  m: number;
  frame: Step | null;
}

export default function SimCanvas({ n, m, frame }: Props) {
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

    const pad = 32;
    const cellW = (W - 2 * pad) / n;
    const cellH = (H - 2 * pad) / m;

    const toCanvas = (gx: number, gy: number): [number, number] => [
      pad + gx * cellW,
      H - pad - gy * cellH,
    ];

    // ── clear ───────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);

    // ── grid lines ──────────────────────────────────────────────
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= n; i++) {
      const [x1, y1] = toCanvas(i, 0);
      const [x2, y2] = toCanvas(i, m);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (let j = 0; j <= m; j++) {
      const [x1, y1] = toCanvas(0, j);
      const [x2, y2] = toCanvas(n, j);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // ── placeholder when idle ───────────────────────────────────
    if (!frame) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Press Start to begin", W / 2, H / 2);
      return;
    }

    const topCoords = pathToCoords(frame.top);
    const botCoords = pathToCoords(frame.bot);

    // ── sandwich (filled area between paths) ────────────────────
    ctx.beginPath();
    for (let i = 0; i < topCoords.length; i++) {
      const [cx, cy] = toCanvas(topCoords[i][0], topCoords[i][1]);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    for (let i = botCoords.length - 1; i >= 0; i--) {
      const [cx, cy] = toCanvas(botCoords[i][0], botCoords[i][1]);
      ctx.lineTo(cx, cy);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(139, 92, 246, 0.12)";
    ctx.fill();

    // ── draw a path line + dots ─────────────────────────────────
    const gridMax = Math.max(n, m);
    const dotR = Math.max(1.5, 4 - gridMax / 15);
    const lw = Math.max(1, 2.5 - gridMax / 30);

    const drawPath = (coords: [number, number][], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i < coords.length; i++) {
        const [cx, cy] = toCanvas(coords[i][0], coords[i][1]);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      ctx.fillStyle = color;
      for (const [gx, gy] of coords) {
        const [cx, cy] = toCanvas(gx, gy);
        ctx.beginPath();
        ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawPath(topCoords, "#3b82f6"); // blue
    drawPath(botCoords, "#ef4444"); // red

    // ── axis tick labels ────────────────────────────────────────
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px system-ui, sans-serif";
    const xTick = Math.max(1, Math.ceil(n / 6));
    const yTick = Math.max(1, Math.ceil(m / 6));

    ctx.textAlign = "center";
    for (let i = 0; i <= n; i += xTick) {
      const [cx, cy] = toCanvas(i, 0);
      ctx.fillText(String(i), cx, cy + 14);
    }
    ctx.textAlign = "right";
    for (let j = 0; j <= m; j += yTick) {
      const [cx, cy] = toCanvas(0, j);
      ctx.fillText(String(j), cx - 6, cy + 4);
    }
  }, [n, m, frame]);

  return (
    <div ref={wrapRef} className="aspect-square w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-lg border border-gray-200 bg-white"
      />
    </div>
  );
}
