import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-black/10 bg-white/80 backdrop-blur-sm",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }) {
  return (
    <div className={cn("p-6", className)} {...props} />
  );
}
