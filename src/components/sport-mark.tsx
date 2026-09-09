import type { ReactNode } from "react";
import type { Sport } from "@/lib/types";
import { cn } from "@/lib/utils";

function Svg({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SportMark({ sport, className }: { sport: Sport; className?: string }) {
  switch (sport) {
    case "futbol":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <path d="M8 8.5 12 7l4 1.5L14.5 12 16 16.5 12 17l-4-1.5L9.5 12Z" />
        </Svg>
      );
    case "baloncesto":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c3 3 3 15 0 18M3 12c3-3 15-3 18 0" />
        </Svg>
      );
    case "voleibol":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7 5c3 4 3 10 0 14M17 5c-3 4-3 10 0 14M4 14c5-1 11-1 16 0" />
        </Svg>
      );
    case "balonmano":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 6c2 3 6 3 8 0M8 18c2-3 6-3 8 0M5 12h14" />
        </Svg>
      );
    case "futsal":
      return (
        <Svg className={className}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <circle cx="12" cy="12" r="3.5" />
        </Svg>
      );
    case "bsr":
      return (
        <Svg className={className}>
          <circle cx="12" cy="13" r="7" />
          <circle cx="12" cy="13" r="3" />
          <path d="M9 5h6" />
        </Svg>
      );
  }
}
