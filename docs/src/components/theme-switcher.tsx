import { useEffect, useState } from "react";
import themeTokensData from "../data/theme-tokens.json";

const themeTokens: Record<string, Record<string, string>> = themeTokensData;

/** Base theme names shown in the switcher UI (excludes dark variants) */
const themeLabels: Record<string, string> = {
  porcelain: "Porcelain",
  tobacco: "Tobacco",
  marigold: "Marigold",
  eucalyptus: "Eucalyptus",
};

const baseThemes = Object.keys(themeLabels);

function getColorScheme(): "auto" | "light" | "dark" {
  const stored = localStorage.getItem("beaket-color-scheme");
  if (stored === "light" || stored === "dark") return stored;
  return "auto";
}

function isDarkMode(): boolean {
  const scheme = getColorScheme();
  if (scheme === "light") return false;
  if (scheme === "dark") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(baseName: string): string {
  const darkKey = `${baseName}-dark`;
  if (isDarkMode() && themeTokens[darkKey]) return darkKey;
  return baseName;
}

function applyTheme(baseName: string, updateUrl = true) {
  const effectiveName = resolveTheme(baseName);
  const tokens = themeTokens[effectiveName];
  if (!tokens) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
    if (key.startsWith("--color-")) {
      root.style.setProperty(key.replace("--color-", "--"), value);
    }
  }
  localStorage.setItem("beaket-theme", baseName);
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("theme", baseName);
    history.replaceState(null, "", url.toString());
  }
}

function getInitialTheme(): string {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("theme");
  if (fromUrl) {
    // Handle direct dark variant URLs (e.g., ?theme=marigold-dark)
    if (fromUrl.endsWith("-dark")) {
      const base = fromUrl.replace(/-dark$/, "");
      if (themeLabels[base]) {
        localStorage.setItem("beaket-color-scheme", "dark");
        return base;
      }
    }
    if (themeLabels[fromUrl]) return fromUrl;
  }
  const fromStorage = localStorage.getItem("beaket-theme");
  if (fromStorage && themeLabels[fromStorage]) return fromStorage;
  return "porcelain";
}

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M13.5 8.5a5.5 5.5 0 0 1-7-7 5.5 5.5 0 1 0 7 7z" />
    </svg>
  );
}

export function ThemeSwitcher({ layout = "sidebar" }: { layout?: "sidebar" | "inline" }) {
  const [active, setActive] = useState("porcelain");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setActive(initial);
    setDark(isDarkMode());
    applyTheme(initial);

    // Live-switch when OS dark mode changes (only if scheme is "auto")
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getColorScheme() !== "auto") return;
      const current = localStorage.getItem("beaket-theme") || "porcelain";
      setDark(isDarkMode());
      applyTheme(current, false);
    };
    mq.addEventListener("change", onChange);
    const onSchemeChange = () => setDark(isDarkMode());
    window.addEventListener("beaket-scheme-change", onSchemeChange);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("beaket-scheme-change", onSchemeChange);
    };
  }, []);

  const handleClick = (name: string) => {
    setActive(name);
    applyTheme(name);
  };

  const toggleDark = () => {
    const newDark = !dark;
    localStorage.setItem("beaket-color-scheme", newDark ? "dark" : "light");
    setDark(newDark);
    const current = localStorage.getItem("beaket-theme") || "porcelain";
    applyTheme(current, false);
    window.dispatchEvent(new Event("beaket-scheme-change"));
  };

  if (layout === "inline") {
    return (
      <nav aria-label="Theme" className="flex items-center gap-2">
        {/* Desktop: button row */}
        <ul className="m-0 hidden list-none gap-2 p-0 sm:flex">
          {baseThemes.map((name) => (
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
        {/* Mobile: select */}
        <select
          value={active}
          onChange={(e) => handleClick(e.target.value)}
          className="border-graphite text-ink border bg-transparent px-2 py-1 text-xs sm:hidden"
        >
          {baseThemes.map((name) => (
            <option key={name} value={name}>
              {themeLabels[name]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={toggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="border-graphite text-ink shadow-offset hover:shadow-offset-hover active:shadow-offset-active hover:bg-frost inline-flex cursor-pointer items-center justify-center border bg-transparent px-1.5 py-0.5 transition-shadow duration-100"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </nav>
    );
  }

  return (
    <>
      {baseThemes.map((name) => {
        const resolvedKey = dark && themeTokens[`${name}-dark`] ? `${name}-dark` : name;
        const chromeColor = themeTokens[resolvedKey]["--color-chrome"];
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

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDarkMode());
    const onSchemeChange = () => setDark(isDarkMode());
    window.addEventListener("beaket-scheme-change", onSchemeChange);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onSchemeChange);
    return () => {
      window.removeEventListener("beaket-scheme-change", onSchemeChange);
      mq.removeEventListener("change", onSchemeChange);
    };
  }, []);

  const toggle = () => {
    const newDark = !dark;
    localStorage.setItem("beaket-color-scheme", newDark ? "dark" : "light");
    setDark(newDark);
    const current = localStorage.getItem("beaket-theme") || "porcelain";
    applyTheme(current, false);
    window.dispatchEvent(new Event("beaket-scheme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-steel hover:text-ink inline-flex cursor-pointer items-center justify-center bg-transparent p-0 transition-colors duration-100"
      style={{ border: "none", lineHeight: 0 }}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
