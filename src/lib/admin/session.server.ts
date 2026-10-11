import { SignJWT, jwtVerify } from "jose";

const COOKIE = "mdm_admin";
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET?.trim() || "mdm-admin-surijavi-futbolme8-2026",
);

export type AdminScope = "all" | "atm-melilla";

type Account = { user: string; pass: string; scope: AdminScope };

const ACCOUNTS: Account[] = [
  {
    user: process.env.ADMIN_USER?.trim() || "surijavi",
    pass: process.env.ADMIN_PASSWORD?.trim() || "Futbolme8",
    scope: "all",
  },
  { user: "adminATM", pass: "admin01", scope: "atm-melilla" },
];

export function findAccount(user: string, password: string): Account | undefined {
  const name = user.trim();
  return ACCOUNTS.find((a) => a.user === name && a.pass === password);
}

export function credentialsOk(user: string, password: string): boolean {
  return Boolean(findAccount(user, password));
}

export async function issueToken(user: string, scope: AdminScope): Promise<string> {
  return new SignJWT({ role: "admin", sub: user, scope })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(SECRET);
}

export async function readSession(): Promise<{ ok: true; user: string; scope: AdminScope } | { ok: false }> {
  const token = await readAdminCookie();
  if (!token) return { ok: false };
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "admin") return { ok: false };
    const scope = payload.scope === "atm-melilla" ? "atm-melilla" : "all";
    return { ok: true, user: String(payload.sub ?? ""), scope };
  } catch {
    return { ok: false };
  }
}

export async function tokenOk(token?: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function readAdminCookie(): Promise<string | undefined> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(COOKIE);
}

export async function writeAdminCookie(token: string): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAdmin(): Promise<boolean> {
  return (await readSession()).ok;
}

export function isAtmMelilla(input: { homeId?: string; awayId?: string; homeName?: string; awayName?: string }): boolean {
  if (input.homeId === "atm-melilla" || input.awayId === "atm-melilla") return true;
  return /atm\s*melilla/i.test(`${input.homeName ?? ""} ${input.awayName ?? ""}`);
}
