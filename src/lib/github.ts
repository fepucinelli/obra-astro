// server-only: GitHub API client module
import { Octokit } from "@octokit/rest";

const OWNER = import.meta.env.GITHUB_REPO_OWNER as string;
const REPO = import.meta.env.GITHUB_REPO_NAME as string;

export function getGitHubClient(token: string): Octokit {
  return new Octokit({ auth: token });
}

export async function getFile(
  path: string,
  token: string
): Promise<{ content: string; sha: string }> {
  const octokit = getGitHubClient(token);
  const response = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path,
  });

  const data = response.data;
  if (Array.isArray(data)) {
    throw new Error(`Path "${path}" is a directory, not a file.`);
  }
  if (data.type !== "file") {
    throw new Error(`Path "${path}" is not a file (type: ${data.type}).`);
  }

  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
  sha: string | undefined,
  token: string
): Promise<void> {
  const octokit = getGitHubClient(token);
  const encodedContent = Buffer.from(content, "utf-8").toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content: encodedContent,
    ...(sha ? { sha } : {}),
  });
}

export async function deleteFile(
  path: string,
  sha: string,
  message: string,
  token: string
): Promise<void> {
  const octokit = getGitHubClient(token);
  await octokit.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    sha,
  });
}

export async function listFiles(
  path: string,
  token: string
): Promise<Array<{ name: string; path: string; sha: string }>> {
  const octokit = getGitHubClient(token);
  const response = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path,
  });

  const data = response.data;
  if (!Array.isArray(data)) {
    throw new Error(`Path "${path}" is not a directory.`);
  }

  return data
    .filter((item) => item.type === "file" || item.type === "dir")
    .map((item) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
    }));
}

/**
 * Converts a plain object into a YAML frontmatter string (between --- delimiters).
 * Handles strings, numbers, booleans, and arrays of primitives.
 */
export function serializeFrontmatter(data: Record<string, unknown>): string {
  const lines: string[] = ["---"];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${serializeScalar(item)}`);
      }
    } else {
      lines.push(`${key}: ${serializeScalar(value)}`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

function serializeScalar(value: unknown): string {
  if (value === null || value === undefined) return '""';
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "number") return value.toString();
  const str = String(value);
  // Quote strings that could be ambiguous in YAML
  if (
    str.includes(":") ||
    str.includes("#") ||
    str.includes('"') ||
    str.includes("'") ||
    str.includes("\n") ||
    str === "" ||
    str === "true" ||
    str === "false" ||
    /^\d/.test(str)
  ) {
    return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return str;
}

/**
 * Parses a markdown string that may begin with YAML frontmatter (--- ... ---).
 * Returns the parsed data object and the body text after the frontmatter.
 */
export function parseFrontmatter(content: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
  const match = content.match(fmRegex);

  if (!match) {
    return { data: {}, body: content };
  }

  const rawYaml = match[1];
  const body = content.slice(match[0].length);
  const data = parseSimpleYaml(rawYaml);

  return { data, body };
}

/**
 * Minimal YAML parser that handles:
 *   - Simple key: value pairs (strings, numbers, booleans)
 *   - Block sequence lists under a key:
 *       tags:
 *         - foo
 *         - bar
 */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (!line.trim()) {
      i++;
      continue;
    }

    const keyValueMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!keyValueMatch) {
      i++;
      continue;
    }

    const key = keyValueMatch[1].trim();
    const rest = keyValueMatch[2].trim();

    if (rest === "") {
      // Possibly a block list follows
      const items: string[] = [];
      i++;
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        const itemMatch = lines[i].match(/^\s+-\s+(.*)/);
        if (itemMatch) {
          items.push(parseScalarValue(itemMatch[1].trim()));
        }
        i++;
      }
      result[key] = items;
    } else {
      result[key] = parseScalarValue(rest);
      i++;
    }
  }

  return result;
}

function parseScalarValue(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;

  // Quoted string
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}
