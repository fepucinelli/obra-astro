import type { AstroCookies } from "astro";

export interface SessionData {
  user?: {
    login: string;
    name: string;
    avatarUrl: string;
    accessToken: string;
  };
}

export async function getSession(cookies: AstroCookies): Promise<SessionData> {
  const sessionCookie = cookies.get("obra-session");
  if (!sessionCookie?.value) return {};
  try {
    return JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    ) as SessionData;
  } catch {
    return {};
  }
}

export async function setSession(
  cookies: AstroCookies,
  data: SessionData
): Promise<void> {
  const encoded = Buffer.from(JSON.stringify(data), "utf-8").toString("base64");
  cookies.set("obra-session", encoded, {
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
