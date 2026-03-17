import { defineMiddleware } from "astro:middleware";
import { getSession } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/admin")) {
    const session = await getSession(context.cookies);
    if (!session.user) {
      return context.redirect("/auth/login");
    }
  }

  return next();
});
