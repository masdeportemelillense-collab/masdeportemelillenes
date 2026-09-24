import { SignJWT, jwtVerify } from "jose";

const COOKIE = "mdm_porra";
const SECRET = new TextEncoder().encode(
  process.env.PORRA_SECRET?.trim() || process.env.ADMIN_SECRET?.trim() || "mdm-porra-melilla-2026",
);
/** ~13 meses. Los navegadores suelen limitar las cookies a unos 400 días. */
const SESSION_SECONDS = 60 * 60 * 24 * 400;

export async function issueUserToken(userId: string, name: string): Promise<string> {
  return new SignJWT({ role: "porra", sub: userId, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(SECRET);
}

export async function readUserToken(token?: string | null): Promise<{ id: string; name: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "porra" || typeof payload.sub !== "string") return null;
    return { id: payload.sub, name: typeof payload.name === "string" ? payload.name : "Jugador" };
  } catch {
    return null;
  }
}

export async function readPorraCookie(): Promise<string | undefined> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(COOKIE);
}

export async function writePorraCookie(token: string): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearPorraCookie(): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function currentPorraUser(): Promise<{ id: string; name: string } | null> {
  return readUserToken(await readPorraCookie());
}

/** Renueva la cookie para que, si el jugador entra de vez en cuando, no caduque. */
export async function touchPorraSession(user: { id: string; name: string }): Promise<void> {
  await writePorraCookie(await issueUserToken(user.id, user.name));
}
