import CSS_EUCALYPTUS from "../../../../src/themes/eucalyptus.css";
import CSS_MARIGOLD from "../../../../src/themes/marigold.css";
import CSS_PORCELAIN from "../../../../src/themes/porcelain.css";
import CSS_TOBACCO from "../../../../src/themes/tobacco.css";

export const THEME_CSS: Record<string, string> = {
  porcelain: CSS_PORCELAIN,
  tobacco: CSS_TOBACCO,
  marigold: CSS_MARIGOLD,
  eucalyptus: CSS_EUCALYPTUS,
};

export const VALID_THEMES = Object.keys(THEME_CSS);
