import * as fs from "fs";
import * as path from "path";
import { withCompilerOptions } from "react-docgen-typescript";
import * as ts from "typescript";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

interface ComponentProps {
  [componentName: string]: PropInfo[];
}

const EXCLUDED_PROPS = new Set(["className"]);
const QUOTED_UNION_RE = /^("[^"]*"(\s*\|\s*"[^"]*")*)$/;

function isSourceFile(fileName: string): boolean {
  return !fileName.includes("node_modules") && fileName.includes("/src/components/");
}

function simplifyTypeName(raw: string): string {
  if (raw === "React.ReactNode" || raw === "ReactNode") return "ReactNode";
  if (QUOTED_UNION_RE.test(raw)) return raw.replace(/"/g, "");
  return raw;
}

// Read registry
const registryPath = path.resolve(__dirname, "../../registry/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

const parser = withCompilerOptions(
  { esModuleInterop: true, jsx: 1 }, // 1 = React
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    propFilter: (prop) => {
      if (EXCLUDED_PROPS.has(prop.name)) return false;
      if (prop.declarations && prop.declarations.length > 0) {
        return prop.declarations.some((d) => isSourceFile(d.fileName));
      }
      return false;
    },
  },
);

// TS program for compound component extraction — only load component files
const tsconfigPath = path.resolve(__dirname, "../../tsconfig.json");
const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.resolve(__dirname, "../.."),
);
const componentFilePaths = registry.components.map((c: { files: string[] }) =>
  path.resolve(__dirname, "../../src", c.files[0]),
);
const program = ts.createProgram(componentFilePaths, parsedConfig.options);
const checker = program.getTypeChecker();

/**
 * When react-docgen-typescript reports type as "enum", extract the actual
 * literal values from the type.value array.
 */
function resolveEnumType(typeName: string, typeValue: unknown): string {
  if (typeName === "enum" && Array.isArray(typeValue)) {
    return typeValue.map((v: { value: string }) => v.value.replace(/"/g, "")).join(" | ");
  }
  return typeName;
}

/**
 * Parse compound component patterns and return the root function name
 * plus a map of functionName → subComponentName (e.g. "CardHeader" → "Header").
 */
function getCompoundMappings(source: string): { root: string | null; subs: Map<string, string> } {
  const subs = new Map<string, string>();
  let root: string | null = null;

  // Pattern 1: Object.assign(RootFunc, { Sub: SubFunc, ... })
  const assignMatch = source.match(/Object\.assign\((\w+),\s*\{([^}]+)\}/s);
  if (assignMatch) {
    root = assignMatch[1];
    const body = assignMatch[2];
    const pairRegex = /(\w+):\s*(\w+)/g;
    let m;
    while ((m = pairRegex.exec(body)) !== null) {
      subs.set(m[2], m[1]); // funcName → subName
    }
  }

  // Pattern 2: ExportedName.SubName = SubFunc;
  const propAssignRegex = /^\w+\.(\w+)\s*=\s*(\w+);/gm;
  let m;
  while ((m = propAssignRegex.exec(source)) !== null) {
    subs.set(m[2], m[1]); // funcName → subName
  }

  return { root, subs };
}

/**
 * Get the declared type annotation text for a symbol, falling back to
 * the checker's typeToString.
 */
function getTypeString(sym: ts.Symbol, contextNode: ts.Node, sourceFile: ts.SourceFile): string {
  const decl = sym.getDeclarations()?.[0];
  if (decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type) {
    return simplifyTypeName(decl.type.getText(sourceFile));
  }
  const propType = checker.getTypeOfSymbolAtLocation(sym, contextNode);
  let str = checker.typeToString(propType);
  if (str === "true | false") str = "boolean";
  return str;
}

/**
 * Extract props from a function declaration using the TypeScript type checker.
 */
function extractFunctionProps(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): PropInfo[] {
  if (!node.parameters.length) return [];

  const propsParam = node.parameters[0];
  const paramType = checker.getTypeAtLocation(propsParam);
  const props: PropInfo[] = [];

  for (const sym of paramType.getProperties()) {
    if (EXCLUDED_PROPS.has(sym.name)) continue;

    const decls = sym.getDeclarations();
    if (!decls?.length) continue;
    if (!decls.some((d) => isSourceFile(d.getSourceFile().fileName))) continue;

    const typeString = getTypeString(sym, propsParam, sourceFile);
    const jsDoc = ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();

    const isOptional = decls.some(
      (d) => (ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) && !!d.questionToken,
    );

    let defaultValue: string | null = null;
    if (ts.isObjectBindingPattern(propsParam.name)) {
      for (const element of propsParam.name.elements) {
        if (
          ts.isBindingElement(element) &&
          ts.isIdentifier(element.name) &&
          element.name.text === sym.name &&
          element.initializer
        ) {
          defaultValue = element.initializer.getText(sourceFile);
          if (defaultValue.startsWith('"') && defaultValue.endsWith('"')) {
            defaultValue = defaultValue.slice(1, -1);
          }
        }
      }
    }

    props.push({
      name: sym.name,
      type: typeString,
      required: !isOptional,
      defaultValue,
      description: jsDoc,
    });
  }

  return props;
}

/**
 * Single AST walk to resolve all "any"-typed props to their declared type
 * annotations (e.g. React.ReactNode → "ReactNode").
 */
function resolveAnyTypes(sourceFile: ts.SourceFile, propNames: Set<string>): Map<string, string> {
  const resolved = new Map<string, string>();

  function visit(node: ts.Node) {
    if (resolved.size === propNames.size) return;
    if (
      (ts.isPropertySignature(node) || ts.isPropertyDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      propNames.has(node.name.text) &&
      node.type
    ) {
      const simplified = simplifyTypeName(node.type.getText(sourceFile));
      if (simplified !== node.type.getText(sourceFile)) {
        resolved.set(node.name.text, simplified);
      }
    }
    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);
  return resolved;
}

function generateProps() {
  const result: ComponentProps = {};

  for (const component of registry.components) {
    const filePath = path.resolve(__dirname, "../../src", component.files[0]);
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const source = sourceFile.text;

    // Step 1: Use react-docgen-typescript for directly exported components
    const docs = parser.parse(filePath);
    const props: PropInfo[] = [];
    const foundSubNames = new Set<string>();

    if (docs.length > 0) {
      for (const doc of docs) {
        const dotIndex = doc.displayName.indexOf(".");
        let prefix = "";
        if (dotIndex !== -1) {
          const subName = doc.displayName.slice(dotIndex + 1);
          prefix = `${subName}.`;
          foundSubNames.add(subName);
        }

        for (const [name, prop] of Object.entries(doc.props)) {
          props.push({
            name: prefix + name,
            type: resolveEnumType(prop.type.name, prop.type.value),
            required: prop.required,
            defaultValue: prop.defaultValue?.value ?? null,
            description: prop.description,
          });
        }
      }
    }

    // Step 2: Use TS compiler API for compound components not found by react-docgen
    const { root: rootFuncName, subs } = getCompoundMappings(source);

    if (subs.size > 0) {
      ts.forEachChild(sourceFile, (node) => {
        if (!ts.isFunctionDeclaration(node) || !node.name) return;
        const funcName = node.name.text;

        if (funcName === rootFuncName && props.length === 0) {
          props.push(...extractFunctionProps(node, sourceFile));
        }

        const subName = subs.get(funcName);
        if (subName && !foundSubNames.has(subName)) {
          const subProps = extractFunctionProps(node, sourceFile);
          for (const prop of subProps) {
            props.push({ ...prop, name: `${subName}.${prop.name}` });
          }
        }
      });
    }

    // Step 3: Batch-resolve "any" types via single AST walk
    const anyPropNames = new Set(
      props.filter((p) => p.type === "any").map((p) => p.name.split(".").pop()!),
    );
    if (anyPropNames.size > 0) {
      const resolved = resolveAnyTypes(sourceFile, anyPropNames);
      for (const prop of props) {
        const baseName = prop.name.split(".").pop()!;
        const better = resolved.get(baseName);
        if (prop.type === "any" && better) prop.type = better;
      }
    }

    result[component.name] = props;
  }

  // Output
  const outputDir = path.resolve(__dirname, "../src/generated");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "props.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

  console.log(`Props generated: ${outputPath}`);
  console.log(`Components: ${Object.keys(result).join(", ")}`);
}

generateProps();
