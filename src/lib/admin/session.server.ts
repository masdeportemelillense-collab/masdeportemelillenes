import { SignJWT, jwtVerify } from "jose";

const COOKIE = "mdm_admin";
const USER = process.env.ADMIN_USER?.trim() || "surijavi";
const PASS = process.env.ADMIN_PASSWORD?.trim() || "Futbolme8";
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET?.trim() || "mdm-admin-surijavi-futbolme8-2026",
);

export function credentialsOk(user: string, password: string): boolean {
  return user.trim() === USER && password === PASS;
}

export async function issueToken(): Promise<string> {
  return new SignJWT({ role: "admin", sub: USER })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(SECRET);
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
  return tokenOk(await readAdminCookie());
}
