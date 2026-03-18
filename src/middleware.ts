import { defineMiddleware } from "astro:middleware";
import { getSession } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  // Decode and normalise the pathname to prevent URL-encoding bypasses.
  // Mitigates GHSA-ggxq-hp9w-j794 and GHSA-whqg-ppgf-wp8c while a full
  // Astro upgrade (4→6) is pending.
  let pathname: string;
  try {
    pathname = decodeURIComponent(context.url.pathname);
    // Guard against double-encoding (%2F → / already handled above;
    // a second pass catches %252F → %2F → /)
    pathname = decodeURIComponent(pathname);
  } catch {
    pathname = context.url.pathname;
  }
  // Normalise any backslash variants and collapse repeated slashes
  pathname = pathname.replace(/\\/g, "/").replace(/\/+/g, "/");

  if (pathname.startsWith("/admin")) {
    const session = await getSession(context.cookies);
    if (!session.user) {
      return context.redirect("/auth/login");
    }
  }

  return next();
});
