"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

type Props = {
  children: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
  step?: number;
};

export function AutoFitText({
  children,
  className,
  maxFontSize = 18,
  minFontSize = 12,
  step = 1,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const fit = () => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;
    let size = maxFontSize;
    textEl.style.fontSize = `${size}px`;
    textEl.style.whiteSpace = "nowrap";
    textEl.style.display = "inline-block";
    const maxWidth = container.clientWidth;
    while (textEl.scrollWidth > maxWidth && size > minFontSize) {
      size -= step;
      textEl.style.fontSize = `${size}px`;
    }
  };

  useLayoutEffect(() => {
    fit();
  }, [children]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={["w-full overflow-hidden", className].filter(Boolean).join(" ")}>
      <span ref={textRef}>{children}</span>
    </div>
  );
}
