import {
  fetchRegistry,
  printCatalog,
  resolveRegistryRef,
  type RegistryOptions,
} from "../utils/registry.ts";

export async function list(query: string | undefined, options: RegistryOptions) {
  const ref = await resolveRegistryRef(options);
  printCatalog(await fetchRegistry(ref), query);
}
