import { badgeFor } from "@/data/badges";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

const PALETTE = [
  ["#15233a", "#e8e6dc"],
  ["#1c3d6e", "#f2f0ea"],
  ["#8b1e1e", "#f0ebe3"],
  ["#1a4a5c", "#e4d7b8"],
  ["#16324f", "#d6d2c8"],
  ["#3d2a28", "#e8e2d6"],
  ["#2e3d32", "#e8e6dc"],
  ["#1b3c6e", "#f0eee6"],
];

function paletteOf(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length] as [string, string];
}

export function TeamBadge({
  id,
  name,
  short,
  primary,
  secondary,
  size = 40,
  className,
}: {
  id?: string;
  name?: string;
  short: string;
  primary?: string;
  secondary?: string;
  size?: number;
  className?: string;
}) {
  const src = badgeFor(id, name);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-md bg-surface-2 object-contain p-0.5", className)}
      />
    );
  }
  const [p, s] = primary && secondary ? [primary, secondary] : paletteOf(name || short);
  const label = short.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M24 3 L43 10 V24 C43 36 33 43 24 45 C15 43 5 36 5 24 V10 Z" fill={p} />
      <path
        d="M24 6 L40 12 V24 C40 34 32 41 24 43 C16 41 8 34 8 24 V12 Z"
        fill="none"
        stroke={s}
        strokeOpacity="0.45"
        strokeWidth="1.4"
      />
      <circle cx="24" cy="14" r="1.6" fill={s} />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill={s}
        fontFamily="Georgia, serif"
        fontSize={label.length > 3 ? 8 : 10}
        fontWeight="700"
      >
        {label}
      </text>
    </svg>
  );
}

export function Crest({
  team,
  size = 40,
  className,
}: {
  team: Pick<Team, "id" | "short" | "primary" | "secondary" | "name">;
  size?: number;
  className?: string;
}) {
  return (
    <TeamBadge
      id={team.id}
      name={team.name}
      short={team.short}
      primary={team.primary}
      secondary={team.secondary}
      size={size}
      className={className}
    />
  );
}

export function OpponentMark({
  short,
  name,
  size = 40,
  badgeUrl,
}: {
  short: string;
  name?: string;
  size?: number;
  badgeUrl?: string;
}) {
  if (badgeUrl) {
    return (
      <img
        src={badgeUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-md bg-surface-2 object-contain p-0.5"
      />
    );
  }
  return <TeamBadge name={name} short={short} size={size} />;
}
