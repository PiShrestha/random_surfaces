"use client";

import { useEffect, useRef } from "react";
import type { Step } from "@/lib/types";
import type { Theme } from "@/hooks/useTheme";
import { exportCanvasAsPng } from "@/lib/export";

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
  loading?: boolean;
  theme: Theme;
}

export default function SimCanvas({ n, m, frame, loading, theme }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDark = () => document.documentElement.classList.contains("dark");

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

    const dark = isDark();
    const bg = dark ? "#111827" : "#ffffff";
    const gridColor = dark ? "#1f2937" : "#e5e7eb";
    const textMuted = dark ? "#6b7280" : "#9ca3af";

    const pad = 32;
    const cellW = (W - 2 * pad) / n;
    const cellH = (H - 2 * pad) / m;

    const toCanvas = (gx: number, gy: number): [number, number] => [
      pad + gx * cellW,
      H - pad - gy * cellH,
    ];

    // ── clear ───────────────────────────────────────────────────
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ── grid lines ──────────────────────────────────────────────
    ctx.strokeStyle = gridColor;
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

    // ── loading state ───────────────────────────────────────────
    if (loading) {
      ctx.fillStyle = textMuted;
      ctx.font = "14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Calculating surface...", W / 2, H / 2);
      return;
    }

    // ── idle state ──────────────────────────────────────────────
    if (!frame) {
      ctx.fillStyle = textMuted;
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
    ctx.fillStyle = dark
      ? "rgba(139, 92, 246, 0.18)"
      : "rgba(139, 92, 246, 0.12)";
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
    ctx.fillStyle = textMuted;
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
  }, [n, m, frame, loading, theme]);

  const handleExport = () => {
    if (canvasRef.current)
      exportCanvasAsPng(canvasRef.current, "lattice-paths.png");
  };

  return (
    <div className="relative">
      <div ref={wrapRef} className="aspect-square w-full">
        <canvas
          ref={canvasRef}
          className="h-full w-full rounded-xl border border-gray-200 dark:border-gray-700"
        />
      </div>
      {frame && (
        <button
          onClick={handleExport}
          title="Export as PNG"
          className="absolute right-2 top-2 rounded-lg bg-white/80 p-1.5 text-gray-500 shadow-sm backdrop-blur transition hover:bg-white dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
