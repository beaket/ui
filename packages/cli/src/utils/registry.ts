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

export async function fetchRegistry(): Promise<Registry> {
  const url = `${GITHUB_RAW_BASE}/registry/registry.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as Registry;
  } catch (error) {
    throw new Error(`Failed to fetch registry from ${url}. Make sure the repository is public.`);
  }
}

export async function fetchComponent(componentDef: ComponentDefinition): Promise<ComponentFile[]> {
  const files: ComponentFile[] = [];

  for (const filePath of componentDef.files) {
    const url = `${GITHUB_RAW_BASE}/src/${filePath}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const content = await response.text();
      files.push({ path: filePath, content });
    } catch (error) {
      throw new Error(`Failed to fetch ${filePath} from ${url}`);
    }
  }

  return files;
}
