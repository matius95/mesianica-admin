import { cookies } from "next/headers";
import { db } from "@/lib/db";

export interface SessionData {
  userId: string;
  email: string;
  expiresAt: number; // Timestamp in ms
}

const COOKIE_NAME = "session_token";

// Helper to get session duration in minutes from DB
export async function getSessionDurationMinutes(): Promise<number> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "session_duration_minutes" },
    });
    if (setting && setting.value) {
      const parsed = parseInt(setting.value, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (err) {
    console.error("Error fetching session duration setting:", err);
  }
  return 30; // Default 30 minutes
}

// Create session cookie with expiration timestamp
export async function createSessionCookie(userId: string, email: string) {
  const durationMinutes = await getSessionDurationMinutes();
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;

  const payload: SessionData = {
    userId,
    email,
    expiresAt,
  };

  const tokenString = Buffer.from(JSON.stringify(payload)).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, tokenString, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

// Verify active valid session
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decodedStr = Buffer.from(token, "base64").toString("utf-8");
    const session: SessionData = JSON.parse(decodedStr);

    // Check expiration timestamp
    if (Date.now() > session.expiresAt) {
      return null; // Session expired
    }

    return session;
  } catch (err) {
    return null;
  }
}

// Destroy session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
