"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftPercent?: number;
  minLeftPercent?: number;
  maxLeftPercent?: number;
}

export function ResizablePanel({
  left,
  right,
  defaultLeftPercent = 40,
  minLeftPercent = 25,
  maxLeftPercent = 60,
}: ResizablePanelProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPercent(
        Math.min(maxLeftPercent, Math.max(minLeftPercent, percent))
      );
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, minLeftPercent, maxLeftPercent]);

  return (
    <div
      ref={containerRef}
      className={cn("flex h-full", isDragging && "select-none cursor-col-resize")}
    >
      {/* Left panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${leftPercent}%` }}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className={cn(
          "group relative flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-white/[0.04] transition-colors hover:bg-vypr-teal/20",
          isDragging && "bg-vypr-teal/30"
        )}
      >
        <div
          className={cn(
            "absolute z-10 flex h-8 w-4 items-center justify-center rounded-full bg-[#1C2240] border border-white/[0.08] transition-all",
            "group-hover:border-vypr-teal/30 group-hover:bg-[#242B4A]",
            isDragging && "border-vypr-teal/50 bg-[#242B4A] scale-110"
          )}
        >
          <div className="flex flex-col gap-0.5">
            <div className="h-2.5 w-px bg-muted-foreground/40 group-hover:bg-vypr-teal/60" />
            <div className="h-2.5 w-px bg-muted-foreground/40 group-hover:bg-vypr-teal/60" />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="h-full flex-1 overflow-hidden">{right}</div>
    </div>
  );
}
