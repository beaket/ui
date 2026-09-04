export interface ComponentDefinition {
  name: string;
  description?: string;
  dependencies: string[];
  registryDependencies: string[];
  files: string[];
  /**
   * Minimum React this component needs, when it is higher than the registry's.
   * A floor is a check, not an install — see `utils/react-version.ts`.
   */
  react?: string;
}

export interface Registry {
  /** Minimum React every component in the registry needs. */
  react?: string;
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

// The timer stays armed until readBody resolves so the body download is covered
// too — fetch() resolves when headers arrive, not when the body is fully read, so
// a CDN that stalls mid-body would otherwise slip past the timeout.
async function fetchWithTimeout<T>(
  url: string,
  readBody: (res: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await readBody(response);
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
    return await fetchWithTimeout(url, async (res) => (await res.json()) as Registry);
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
      const content = await fetchWithTimeout(url, (res) => res.text());
      files.push({ path: filePath, content });
    } catch (error) {
      throw new Error(`Failed to fetch ${filePath} from ${url}: ${describeFetchError(error)}`);
    }
  }

  return files;
}
