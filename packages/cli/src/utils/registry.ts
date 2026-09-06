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

export function resolveComponents(registry: Registry, names: string[]): ComponentDefinition[] {
  const resolved = new Map<string, ComponentDefinition>();
  function visit(name: string) {
    if (resolved.has(name)) return;
    const definition = registry.components.find((component) => component.name === name);
    if (!definition) throw new Error(`Component not found: ${name}`);
    resolved.set(name, definition);
    for (const dependency of definition.registryDependencies) visit(dependency);
  }
  names.forEach(visit);
  return [...resolved.values()];
}

declare const __VERSION__: string;
export const CLI_VERSION = typeof __VERSION__ === "undefined" ? "0.0.0" : __VERSION__;
export const DEFAULT_REGISTRY_REF = `@beaket/ui@${CLI_VERSION}`;
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/beaket/ui";

export interface RegistryOptions {
  registryRef?: string;
  latest?: boolean;
}

export async function resolveRegistryRef(options: RegistryOptions = {}): Promise<string> {
  if (options.latest && options.registryRef)
    throw new Error("Use either --latest or --registry-ref, not both.");
  const ref = options.latest ? "main" : options.registryRef || DEFAULT_REGISTRY_REF;
  if (!/^[\w@./-]+$/.test(ref) || ref.split("/").includes(".."))
    throw new Error("Invalid registry ref.");
  if (/^[a-f0-9]{40}$/i.test(ref) || ref.startsWith("@beaket/ui@")) return ref;
  // A moving branch must become a commit before its files or baseline are fetched.
  const url = `https://api.github.com/repos/beaket/ui/commits/${encodeURIComponent(ref)}`;
  const commit = await fetchWithTimeout(
    url,
    async (response) => (await response.json()) as { sha: string },
  );
  if (!/^[a-f0-9]{40}$/i.test(commit.sha)) throw new Error(`Could not resolve registry ref ${ref}`);
  return commit.sha;
}

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

export async function fetchRegistry(ref = DEFAULT_REGISTRY_REF): Promise<Registry> {
  const url = `${GITHUB_RAW_BASE}/${ref}/registry/registry.json`;

  try {
    return await fetchWithTimeout(url, async (res) => (await res.json()) as Registry);
  } catch (error) {
    throw new Error(
      `Failed to fetch registry from ${url}: ${describeFetchError(error)}. Make sure the repository is public. If this release tag is missing, use --latest explicitly or --registry-ref <tag|sha>.`,
    );
  }
}

export async function fetchComponent(
  componentDef: ComponentDefinition,
  ref = DEFAULT_REGISTRY_REF,
): Promise<ComponentFile[]> {
  const files: ComponentFile[] = [];

  for (const filePath of componentDef.files) {
    if (!/^components\/[\w-]+(?:\.[\w-]+)*\.tsx$/.test(filePath))
      throw new Error(`Invalid component file path: ${filePath}`);
    const url = `${GITHUB_RAW_BASE}/${ref}/src/${filePath}`;

    try {
      const content = await fetchWithTimeout(url, (res) => res.text());
      files.push({ path: filePath, content });
    } catch (error) {
      throw new Error(`Failed to fetch ${filePath} from ${url}: ${describeFetchError(error)}`);
    }
  }

  return files;
}
