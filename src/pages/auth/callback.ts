import type { APIRoute } from "astro";
import { exchangeCodeForToken, getGitHubUser, setSession } from "../../lib/auth";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = cookies.get("obra-oauth-state")?.value;

  if (!code || !state || state !== savedState) {
    return new Response("Invalid OAuth state", { status: 400 });
  }

  cookies.delete("obra-oauth-state", { path: "/" });

  try {
    const token = await exchangeCodeForToken(code);
    const user = await getGitHubUser(token);

    await setSession(cookies, {
      user: { ...user, accessToken: token },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return new Response(message, { status: 500 });
  }

  return redirect("/admin");
};
