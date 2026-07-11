export interface ComponentDefinition {
  name: string;
  description?: string;
  dependencies: string[];
  registryDependencies: string[];
  files: string[];
}

export interface Registry {
  components: ComponentDefinition[];
}

export interface ComponentFile {
  path: string;
  content: string;
}

// GitHub raw URL base - update this to your repo
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/beaket/ui/main";

// Node's fetch has no built-in timeout; without one a slow or unreachable CDN
// hangs the CLI until the OS-level TCP timeout fires (minutes).
export const FETCH_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Surface the real cause (ENOTFOUND, ECONNREFUSED, proxy errors, timeouts)
// instead of collapsing everything into the generic guidance message.
function describeFetchError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return `request timed out after ${FETCH_TIMEOUT_MS / 1000}s`;
    }
    return error.message;
  }
  return String(error);
}

export async function fetchRegistry(): Promise<Registry> {
  const url = `${GITHUB_RAW_BASE}/registry/registry.json`;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as Registry;
  } catch (error) {
    throw new Error(
      `Failed to fetch registry from ${url}: ${describeFetchError(error)}. Make sure the repository is public.`,
    );
  }
}

export async function fetchComponent(componentDef: ComponentDefinition): Promise<ComponentFile[]> {
  const files: ComponentFile[] = [];

  for (const filePath of componentDef.files) {
    const url = `${GITHUB_RAW_BASE}/src/${filePath}`;

    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const content = await response.text();
      files.push({ path: filePath, content });
    } catch (error) {
      throw new Error(`Failed to fetch ${filePath} from ${url}: ${describeFetchError(error)}`);
    }
  }

  return files;
}
