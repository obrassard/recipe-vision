import path from "node:path";
import { mkdir } from "node:fs/promises";
import { renderPdfFromHtml } from "./pdf";
import { renderRecipeHtml } from "./template";
import { parseRecipe } from "./types";

function printUsage(): void {
  console.error("Usage: bun run recipe:pdf <input-json> [output-pdf]");
}

function resolveHtmlOutputPath(outputPdfPath: string): string {
  const parsed = path.parse(outputPdfPath);
  return path.join(parsed.dir, `${parsed.name}.html`);
}

function resolveOutputPath(inputPath: string, explicitOutputPath?: string): string {
  if (explicitOutputPath) {
    return path.resolve(explicitOutputPath);
  }

  const parsed = path.parse(inputPath);
  return path.resolve("dist", `${parsed.name}.pdf`);
}

async function main(): Promise<void> {
  const [, , inputPathArg, outputPathArg] = process.argv;

  if (!inputPathArg) {
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(inputPathArg);
  const outputPath = resolveOutputPath(inputPath, outputPathArg);
  const htmlOutputPath = resolveHtmlOutputPath(outputPath);
  await mkdir(path.dirname(outputPath), { recursive: true });

  const rawRecipe = await Bun.file(inputPath).json();
  const recipe = parseRecipe(rawRecipe);
  const html = renderRecipeHtml(recipe);

  await Bun.write(htmlOutputPath, html);
  await renderPdfFromHtml(html, outputPath);
  console.log(`HTML generated: ${htmlOutputPath}`);
  console.log(`PDF generated: ${outputPath}`);
}

await main();
