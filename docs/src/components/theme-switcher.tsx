import { useEffect, useState } from "react";
import themeTokensData from "../data/theme-tokens.json";

const themeTokens: Record<string, Record<string, string>> = themeTokensData;

const themeLabels: Record<string, string> = {
  porcelain: "Porcelain",
  tobacco: "Tobacco",
  marigold: "Marigold",
  eucalyptus: "Eucalyptus",
};

function applyTheme(name: string, updateUrl = true) {
  const tokens = themeTokens[name];
  if (!tokens) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
    if (key.startsWith("--color-")) {
      root.style.setProperty(key.replace("--color-", "--"), value);
    }
  }
  localStorage.setItem("beaket-theme", name);
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("theme", name);
    history.replaceState(null, "", url.toString());
  }
}

function getInitialTheme(): string {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("theme");
  if (fromUrl && themeTokens[fromUrl]) return fromUrl;
  const fromStorage = localStorage.getItem("beaket-theme");
  if (fromStorage && themeTokens[fromStorage]) return fromStorage;
  return "porcelain";
}

export function ThemeSwitcher({ layout = "sidebar" }: { layout?: "sidebar" | "inline" }) {
  const [active, setActive] = useState("porcelain");

  useEffect(() => {
    const initial = getInitialTheme();
    setActive(initial);
    applyTheme(initial);
  }, []);

  const handleClick = (name: string) => {
    setActive(name);
    applyTheme(name);
  };

  if (layout === "inline") {
    return (
      <nav aria-label="Theme">
        <ul className="m-0 flex list-none gap-2 p-0">
          {Object.keys(themeTokens).map((name) => (
            <li key={name}>
              <button
                type="button"
                data-slot="theme-link"
                onClick={() => handleClick(name)}
                data-active={active === name || undefined}
                className="border-graphite text-ink shadow-offset hover:shadow-offset-hover active:shadow-offset-active hover:bg-frost data-[active]:text-paper data-[active]:bg-branch data-[active]:hover:bg-branch inline-block cursor-pointer border bg-transparent px-2 py-0.5 text-left text-xs no-underline transition-shadow duration-100 data-[active]:shadow-none data-[active]:hover:shadow-none"
              >
                {themeLabels[name]}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <>
      {Object.keys(themeTokens).map((name) => {
        const chromeColor = themeTokens[name]["--color-chrome"];
        return (
          <button
            type="button"
            key={name}
            onClick={() => handleClick(name)}
            className={`sidebar-link${active === name ? "active" : ""} bg-transparent`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                backgroundColor: chromeColor,
                border: active === name ? "1px solid var(--ink)" : "none",
                flexShrink: 0,
              }}
            />
            {themeLabels[name]}
          </button>
        );
      })}
    </>
  );
}
