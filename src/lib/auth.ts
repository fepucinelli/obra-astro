import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import type { AstroCookies } from "astro";

export interface SessionData {
  user?: {
    login: string;
    name: string;
    avatarUrl: string;
    accessToken: string;
  };
}

function getSecretKey(): Buffer {
  const secret = import.meta.env.SESSION_SECRET as string | undefined;
  if (!secret || secret.length !== 64) {
    throw new Error(
      "SESSION_SECRET must be a 64-character hex string (32 bytes). Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(secret, "hex");
}

function encrypt(plaintext: string): string {
  const key = getSecretKey();
  const iv = randomBytes(12); // 96-bit IV for AES-GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16 bytes
  // Layout: iv (12) + authTag (16) + ciphertext → hex
  return Buffer.concat([iv, authTag, encrypted]).toString("hex");
}

function decrypt(ciphertext: string): string {
  const key = getSecretKey();
  const buf = Buffer.from(ciphertext, "hex");
  if (buf.length < 29) throw new Error("Ciphertext too short");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}

export async function getSession(cookies: AstroCookies): Promise<SessionData> {
  const sessionCookie = cookies.get("obra-session");
  if (!sessionCookie?.value) return {};
  try {
    // Try AES-256-GCM decryption first
    const plaintext = decrypt(sessionCookie.value);
    return JSON.parse(plaintext) as SessionData;
  } catch {
    // Fall back gracefully for old Base64 cookies or decryption failures
    return {};
  }
}

export async function setSession(
  cookies: AstroCookies,
  data: SessionData
): Promise<void> {
  const encrypted = encrypt(JSON.stringify(data));
  cookies.set("obra-session", encrypted, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSession(cookies: AstroCookies): Promise<void> {
  cookies.delete("obra-session", { path: "/" });
}

export function getGitHubOAuthURL(state: string): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.GITHUB_CLIENT_ID as string,
    redirect_uri: import.meta.env.GITHUB_REDIRECT_URI || "",
    scope: "repo",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: import.meta.env.GITHUB_CLIENT_ID,
      client_secret: import.meta.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = (await response.json()) as {
    access_token: string;
    error?: string;
  };

  if (data.error || !data.access_token) {
    throw new Error(
      `GitHub token exchange failed: ${data.error ?? "no access_token returned"}`
    );
  }

  return data.access_token;
}

export async function getGitHubUser(token: string): Promise<{
  login: string;
  name: string;
  avatarUrl: string;
}> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch GitHub user: ${response.status} ${response.statusText}`
    );
  }

  const user = (await response.json()) as {
    login: string;
    name: string | null;
    avatar_url: string;
  };

  return {
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
  };
}
