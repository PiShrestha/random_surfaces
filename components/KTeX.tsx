"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface Props {
  tex: string;
  display?: boolean;
  className?: string;
}

export default function KTeX({ tex, display = false, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    katex.render(tex, ref.current, {
      displayMode: display,
      throwOnError: false,
    });
  }, [tex, display]);

  return <span ref={ref} className={className} />;
}
