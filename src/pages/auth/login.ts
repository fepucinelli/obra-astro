import type { APIRoute } from "astro";
import { getGitHubOAuthURL } from "../../lib/auth";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const state = Math.random().toString(36).substring(2, 15);
  cookies.set("obra-oauth-state", state, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });
  return redirect(getGitHubOAuthURL(state));
};
