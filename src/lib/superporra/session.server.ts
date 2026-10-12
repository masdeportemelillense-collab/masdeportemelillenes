import { SignJWT, jwtVerify } from "jose";

const COOKIE = "mdm_super";
const SECRET = new TextEncoder().encode(
  process.env.SUPER_SECRET?.trim() || process.env.ADMIN_SECRET?.trim() || "mdm-superporra-melilla-2026",
);
const SESSION_SECONDS = 60 * 60 * 24 * 400;

export async function issueUserToken(userId: string, name: string): Promise<string> {
  return new SignJWT({ role: "super", sub: userId, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(SECRET);
}

export async function readUserToken(token?: string | null): Promise<{ id: string; name: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "super" || typeof payload.sub !== "string") return null;
    return { id: payload.sub, name: typeof payload.name === "string" ? payload.name : "Jugador" };
  } catch {
    return null;
  }
}

export async function readSuperCookie(): Promise<string | undefined> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(COOKIE);
}

export async function writeSuperCookie(token: string): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSuperCookie(): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function currentSuperUser(): Promise<{ id: string; name: string } | null> {
  return readUserToken(await readSuperCookie());
}
