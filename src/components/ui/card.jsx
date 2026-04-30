import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className = "", ...props }) {
  return (
    <div
      className={cn(
        // stronger separation from brand background
        "rounded-lg border border-black/15",
        "bg-white/90 backdrop-blur-md",
        "shadow-[0_2px_6px_rgba(0,0,0,0.06)]",
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
