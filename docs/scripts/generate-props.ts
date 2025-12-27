import * as fs from "fs";
import * as path from "path";
import { withCompilerOptions } from "react-docgen-typescript";
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

// Read registry
const registryPath = path.resolve(__dirname, "../../registry/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

// Parser options
const parser = withCompilerOptions(
  { esModuleInterop: true, jsx: 1 }, // 1 = React
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    propFilter: (prop) => {
      // Only keep props defined in our source files (not from node_modules)
      if (prop.declarations && prop.declarations.length > 0) {
        return prop.declarations.some(
          (d) => !d.fileName.includes("node_modules") && d.fileName.includes("/src/components/"),
        );
      }
      return false;
    },
  },
);

function generateProps() {
  const result: ComponentProps = {};

  for (const component of registry.components) {
    const filePath = path.resolve(__dirname, "../../src", component.files[0]);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const docs = parser.parse(filePath);

    if (docs.length > 0) {
      const componentDoc = docs[0];
      result[component.name] = Object.entries(componentDoc.props).map(([name, prop]) => ({
        name,
        type: prop.type.name,
        required: prop.required,
        defaultValue: prop.defaultValue?.value ?? null,
        description: prop.description,
      }));
    }
  }

  // Output
  const outputDir = path.resolve(__dirname, "../src/generated");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "props.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log(`Props generated: ${outputPath}`);
  console.log(`Components: ${Object.keys(result).join(", ")}`);
}

generateProps();
