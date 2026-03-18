import type { APIRoute } from "astro";
import { getSession } from "../../../lib/auth";
import {
  getFile,
  createOrUpdateFile,
  deleteFile,
  listFiles,
  serializeFrontmatter,
  parseFrontmatter,
} from "../../../lib/github";

const VALID_TYPES = new Set(["blog", "events", "podcasts"]);
const SLUG_RE = /^[a-z0-9-]{1,100}$/;

function invalidType(type: string | undefined): Response {
  return new Response(JSON.stringify({ error: "Invalid content type" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

function invalidSlug(): Response {
  return new Response(JSON.stringify({ error: "Invalid slug" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

// GET - fetch single file or list all files for a content type
export const GET: APIRoute = async ({ params, url, cookies }) => {
  const session = await getSession(cookies);
  if (!session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { type } = params;
  if (!type || !VALID_TYPES.has(type)) return invalidType(type);

  const slug = url.searchParams.get("slug");
  if (slug !== null && !SLUG_RE.test(slug)) return invalidSlug();

  try {
    if (slug) {
      const path = `src/content/${type}/${slug}.md`;
      const { content } = await getFile(path, session.user.accessToken);
      const { data, body } = parseFrontmatter(content);
      return new Response(JSON.stringify({ ...data, body }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const files = await listFiles(`src/content/${type}`, session.user.accessToken);
    return new Response(JSON.stringify(files), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST - create a new content file
export const POST: APIRoute = async ({ params, request, cookies }) => {
  const session = await getSession(cookies);
  if (!session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { type } = params;
  if (!type || !VALID_TYPES.has(type)) return invalidType(type);

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { body: markdownBody, ...frontmatterData } = body;

    const title = (frontmatterData.title || frontmatterData.name) as string;
    if (!title) {
      return new Response(JSON.stringify({ error: "title or name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const path = `src/content/${type}/${slug}.md`;
    const content = `${serializeFrontmatter(frontmatterData)}\n${markdownBody || ""}`;

    await createOrUpdateFile(
      path,
      content,
      `feat(content): add ${type} post "${title}"`,
      undefined,
      session.user.accessToken
    );

    return new Response(JSON.stringify({ slug, path }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// PUT - update an existing content file
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const session = await getSession(cookies);
  if (!session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { type } = params;
  if (!type || !VALID_TYPES.has(type)) return invalidType(type);

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { slug, body: markdownBody, ...frontmatterData } = body;

    if (!slug || typeof slug !== "string" || !SLUG_RE.test(slug)) {
      return new Response(JSON.stringify({ error: "slug is required for updates" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const path = `src/content/${type}/${slug}.md`;
    const { sha } = await getFile(path, session.user.accessToken);

    const title = (frontmatterData.title || frontmatterData.name) as string;
    const content = `${serializeFrontmatter(frontmatterData)}\n${markdownBody || ""}`;

    await createOrUpdateFile(
      path,
      content,
      `feat(content): update ${type} "${title}"`,
      sha,
      session.user.accessToken
    );

    return new Response(JSON.stringify({ slug, path }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// DELETE - remove a content file
export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const session = await getSession(cookies);
  if (!session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { type } = params;
  if (!type || !VALID_TYPES.has(type)) return invalidType(type);

  try {
    const { slug } = (await request.json()) as { slug: string };

    if (!slug || !SLUG_RE.test(slug)) {
      return new Response(JSON.stringify({ error: "slug is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const path = `src/content/${type}/${slug}.md`;
    const { sha } = await getFile(path, session.user.accessToken);

    await deleteFile(
      path,
      sha,
      `feat(content): delete ${type} "${slug}"`,
      session.user.accessToken
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
