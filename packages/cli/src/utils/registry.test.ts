import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_REGISTRY_REF,
  FETCH_TIMEOUT_MS,
  fetchComponent,
  fetchRegistry,
  resolveComponents,
  resolveRegistryRef,
  type ComponentDefinition,
} from "./registry.ts";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("pins the default tag and resolves moving refs to one immutable commit", async () => {
  expect(await resolveRegistryRef()).toBe(DEFAULT_REGISTRY_REF);
  const sha = "a".repeat(40);
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ sha })));
  vi.stubGlobal("fetch", fetch);
  expect(await resolveRegistryRef({ latest: true })).toBe(sha);
  expect(fetch.mock.calls[0][0]).toContain("/commits/main");
  await expect(resolveRegistryRef({ latest: true, registryRef: "v1" })).rejects.toThrow("either");
  await expect(resolveRegistryRef({ registryRef: "../main" })).rejects.toThrow("Invalid");
});

it("fetches registry and component bytes from the same explicit ref", async () => {
  const fetch = vi.fn().mockImplementation(() => Promise.resolve(new Response("{}")));
  vi.stubGlobal("fetch", fetch);
  await fetchRegistry("@beaket/ui@3.1.0");
  await fetchComponent(buttonDef, "@beaket/ui@3.1.0");
  expect(fetch.mock.calls.map(([url]) => url)).toEqual([
    "https://raw.githubusercontent.com/beaket/ui/@beaket/ui@3.1.0/registry/registry.json",
    "https://raw.githubusercontent.com/beaket/ui/@beaket/ui@3.1.0/src/components/button.tsx",
  ]);
});

// A fetch that never resolves on its own but rejects with an AbortError once
// its signal aborts — mirrors a hung connection to a slow/unreachable CDN.
function hangingFetch() {
  return vi.fn((_url: string, init?: { signal?: AbortSignal }) => {
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener("abort", () => {
        reject(new DOMException("The operation was aborted", "AbortError"));
      });
    });
  });
}

function rejectingFetch(error: Error) {
  return vi.fn(() => Promise.reject(error));
}

// Headers arrive immediately (fetch resolves) but the body read hangs until the
// signal aborts — mirrors a CDN that stalls mid-body after sending headers.
function bodyHangsFetch() {
  return vi.fn((_url: string, init?: { signal?: AbortSignal }) => {
    const signal = init?.signal;
    const hang = () =>
      new Promise<never>((_resolve, reject) => {
        signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted", "AbortError"));
        });
      });
    return Promise.resolve({ ok: true, json: hang, text: hang } as unknown as Response);
  });
}

const buttonDef: ComponentDefinition = {
  name: "button",
  dependencies: [],
  registryDependencies: [],
  files: ["components/button.tsx"],
};

it("resolves transitive, shared and cyclic dependencies once and rejects missing entries", () => {
  const table = { ...buttonDef, name: "table", registryDependencies: ["button"] };
  const dataTable = { ...buttonDef, name: "data-table", registryDependencies: ["table", "button"] };
  const registry = { components: [buttonDef, table, dataTable] };
  expect(
    resolveComponents(registry, ["data-table", "table"]).map((component) => component.name),
  ).toEqual(["data-table", "table", "button"]);
  expect(
    resolveComponents({ components: [{ ...buttonDef, registryDependencies: ["button"] }] }, [
      "button",
    ]),
  ).toHaveLength(1);
  expect(() => resolveComponents({ components: [dataTable] }, ["data-table"])).toThrow(
    "Component not found: table",
  );
});

describe("fetchRegistry", () => {
  it("aborts after the timeout with a message naming the timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", hangingFetch());

    const promise = fetchRegistry();
    const assertion = expect(promise).rejects.toThrow(
      /Failed to fetch registry from .*: request timed out after 10s/,
    );

    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS);
    await assertion;
  });

  it("preserves the underlying error reason", async () => {
    vi.stubGlobal(
      "fetch",
      rejectingFetch(new Error("getaddrinfo ENOTFOUND raw.githubusercontent.com")),
    );

    await expect(fetchRegistry()).rejects.toThrow(
      /getaddrinfo ENOTFOUND raw\.githubusercontent\.com/,
    );
    // Still keeps the actionable guidance.
    await expect(fetchRegistry()).rejects.toThrow(/Make sure the repository is public/);
  });

  it("reports non-ok HTTP responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("nope", { status: 404 }))),
    );

    await expect(fetchRegistry()).rejects.toThrow(/HTTP 404/);
  });

  it("aborts when the body read stalls after headers arrive", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", bodyHangsFetch());

    const promise = fetchRegistry();
    const assertion = expect(promise).rejects.toThrow(/request timed out after 10s/);

    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS);
    await assertion;
  });
});

describe("fetchComponent", () => {
  it("aborts after the timeout with a message naming the timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", hangingFetch());

    const promise = fetchComponent(buttonDef);
    const assertion = expect(promise).rejects.toThrow(
      /Failed to fetch components\/button\.tsx from .*: request timed out after 10s/,
    );

    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS);
    await assertion;
  });

  it("preserves the underlying error reason", async () => {
    vi.stubGlobal("fetch", rejectingFetch(new Error("connect ECONNREFUSED")));

    await expect(fetchComponent(buttonDef)).rejects.toThrow(/connect ECONNREFUSED/);
  });
});
