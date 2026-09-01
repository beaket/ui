import CSS_EUCALYPTUS from "../../../../src/themes/eucalyptus.css";
import CSS_FOUNDATION from "../../../../src/themes/foundation.css";
import CSS_MARIGOLD from "../../../../src/themes/marigold.css";
import CSS_PORCELAIN from "../../../../src/themes/porcelain.css";
import CSS_SEMANTIC from "../../../../src/themes/semantic.css";
import CSS_SOLACE from "../../../../src/themes/solace.css";
import CSS_TOBACCO from "../../../../src/themes/tobacco.css";

// The foundation and semantic layers are authored once; each injected theme
// block bundles both with that theme's 30-value palette so a consumer's CSS is
// self-sufficient. 27 palette values feed the semantic layer; tone 8–10 are
// reserved for neutral-ramp compatibility and future deep-ink roles.
const withFoundation = (palette: string): string =>
  `${CSS_FOUNDATION}\n${CSS_SEMANTIC}\n${palette}`;

export const THEME_CSS: Record<string, string> = {
  solace: withFoundation(CSS_SOLACE),
  porcelain: withFoundation(CSS_PORCELAIN),
  tobacco: withFoundation(CSS_TOBACCO),
  marigold: withFoundation(CSS_MARIGOLD),
  eucalyptus: withFoundation(CSS_EUCALYPTUS),
};

export const VALID_THEMES = Object.keys(THEME_CSS);
