import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import themeTokensData from "../data/theme-tokens.json";

const themeTokens: Record<string, Record<string, string>> = themeTokensData;

/** Base theme names shown in the switcher UI (excludes dark variants) */
const themeLabels: Record<string, string> = {
  solace: "Solace",
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
  }
  // Code blocks read the theme's dark twin whichever scheme the page is in.
  const code = themeTokens[`${baseName}-dark`] ?? tokens;
  for (const [key, value] of Object.entries(code)) {
    root.style.setProperty(key.replace(/^--/, "--code-"), value);
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
  return "solace";
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
  const [active, setActive] = useState("solace");
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
      const current = localStorage.getItem("beaket-theme") || "solace";
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
    const current = localStorage.getItem("beaket-theme") || "solace";
    applyTheme(current, false);
    window.dispatchEvent(new Event("beaket-scheme-change"));
  };

  if (layout === "inline") {
    return (
      // Button, not a copy of it: the old markup re-implemented the outline
      // border, the hover edge and the press translation by hand, under a
      // `data-slot` no registry component owns.
      <nav aria-label="Theme" className="flex flex-wrap items-center gap-2">
        {baseThemes.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={active === name ? "primary" : "outline"}
            aria-pressed={active === name}
            onClick={() => handleClick(name)}
          >
            {themeLabels[name]}
          </Button>
        ))}
        <Button
          size="icon"
          variant="outline"
          onClick={toggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </nav>
    );
  }

  return (
    <>
      {baseThemes.map((name) => {
        const resolvedKey = dark && themeTokens[`${name}-dark`] ? `${name}-dark` : name;
        const accentColor = themeTokens[resolvedKey]["--signal-accent"];
        return (
          <button
            type="button"
            key={name}
            onClick={() => handleClick(name)}
            className={`sidebar-link bg-transparent ${active === name ? "active" : ""}`}
            style={{ justifyContent: "flex-start", gap: "8px" }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 16,
                height: 10,
                backgroundColor: accentColor,
                border: "1px solid var(--color-border-strong)",
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
    const current = localStorage.getItem("beaket-theme") || "solace";
    applyTheme(current, false);
    window.dispatchEvent(new Event("beaket-scheme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-fg-muted hover:text-fg inline-flex cursor-pointer items-center justify-center bg-transparent p-0 transition-colors duration-100"
      style={{ border: "none", lineHeight: 0 }}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
