/**
 * Extracts named exports from a story file source code.
 * Returns a Map of export name to source code.
 */
export function extractExports(source: string): Map<string, string> {
  const exports = new Map<string, string>();
  const lines = source.split("\n");

  let currentExport: { name: string; startLine: number } | null = null;
  let braceDepth = 0;
  let parenDepth = 0;
  let inString: string | null = null;
  let inTemplateLiteral = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for new export (only at the start of a line, after optional whitespace)
    if (!currentExport) {
      const exportMatch = line.match(/^export\s+const\s+(\w+)/);
      if (exportMatch) {
        currentExport = { name: exportMatch[1], startLine: i };
        braceDepth = 0;
        parenDepth = 0;
      }
    }

    if (currentExport) {
      // Parse the line character by character to track depth
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const prevChar = j > 0 ? line[j - 1] : "";

        // Handle string literals
        if (!inTemplateLiteral && (char === '"' || char === "'") && prevChar !== "\\") {
          if (inString === char) {
            inString = null;
          } else if (!inString) {
            inString = char;
          }
          continue;
        }

        // Handle template literals
        if (char === "`" && prevChar !== "\\") {
          inTemplateLiteral = !inTemplateLiteral;
          continue;
        }

        // Skip if inside a string
        if (inString || inTemplateLiteral) continue;

        // Track braces and parens
        if (char === "{") braceDepth++;
        if (char === "}") braceDepth--;
        if (char === "(") parenDepth++;
        if (char === ")") parenDepth--;
      }

      // Export ends when balanced and line ends with ; or )
      const trimmedLine = line.trimEnd();
      if (
        braceDepth === 0 &&
        parenDepth === 0 &&
        (trimmedLine.endsWith(";") || trimmedLine.endsWith(")"))
      ) {
        const code = lines.slice(currentExport.startLine, i + 1).join("\n");
        // Skip the default export (meta)
        if (currentExport.name !== "default") {
          exports.set(currentExport.name, code);
        }
        currentExport = null;
        inString = null;
        inTemplateLiteral = false;
      }
    }
  }

  return exports;
}

/**
 * Formats an export name into a display title.
 * AllVariants -> Variants
 * Default -> Default
 * ClickTest -> Click Test
 */
export function formatExportName(name: string): string {
  // Remove "All" prefix
  let formatted = name.replace(/^All/, "");

  // Add spaces before capital letters (camelCase to Title Case)
  formatted = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");

  return formatted || name;
}
