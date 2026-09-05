import tsParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  { ignores: ["**/dist/**", "**/coverage/**", "storybook-static/**"] },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "jsx-a11y": jsxA11y },
    settings: { "jsx-a11y": { components: { Label: "label" } } },
    rules: jsxA11y.configs.recommended.rules,
  },
];
