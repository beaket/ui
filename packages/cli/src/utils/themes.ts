import CSS_EUCALYPTUS from "../../../../src/themes/eucalyptus.css";
import CSS_MARIGOLD from "../../../../src/themes/marigold.css";
import CSS_PORCELAIN from "../../../../src/themes/porcelain.css";
import CSS_SEMANTIC from "../../../../src/themes/semantic.css";
import CSS_SOLACE from "../../../../src/themes/solace.css";
import CSS_TOBACCO from "../../../../src/themes/tobacco.css";

// The semantic layer (68 shared names) is authored once; each injected theme
// block bundles it with that theme's 32-value palette so a consumer's CSS is
// self-sufficient.
const withSemantic = (palette: string): string => `${CSS_SEMANTIC}\n${palette}`;

export const THEME_CSS: Record<string, string> = {
  solace: withSemantic(CSS_SOLACE),
  porcelain: withSemantic(CSS_PORCELAIN),
  tobacco: withSemantic(CSS_TOBACCO),
  marigold: withSemantic(CSS_MARIGOLD),
  eucalyptus: withSemantic(CSS_EUCALYPTUS),
};

export const VALID_THEMES = Object.keys(THEME_CSS);
