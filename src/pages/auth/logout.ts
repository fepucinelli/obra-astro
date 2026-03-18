export const prerender = false;
import type { APIRoute } from "astro";
import { clearSession } from "../../lib/auth";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  await clearSession(cookies);
  return redirect("/");
};
