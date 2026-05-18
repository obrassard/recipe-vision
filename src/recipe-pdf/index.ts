import path from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import { renderPdfFromPage, withPdfPage } from "./pdf";
import { renderRecipeHtml } from "./template";
import { parseRecipe } from "./types";

function resolveOutputPath(inputPath: string, outputDirectory: string): string {
  const parsed = path.parse(inputPath);
  return path.resolve(outputDirectory, `${parsed.name}.pdf`);
}

async function main(): Promise<void> {
  if (!process.env.PDFS_PATH) {
    console.error("Please specify the path to the PDFs repository using the PDFS_PATH environment variable.");
    process.exit(1);
  }

  if (!process.env.JSONS_PATH) {
    console.error("Please specify the path to the output JSONs repository using the JSONS_PATH environment variable.");
    process.exit(1);
  }

  const inputDirectory = path.resolve(process.env.JSONS_PATH);
  const outputDirectory = path.resolve(process.env.PDFS_PATH);
  await mkdir(outputDirectory, { recursive: true });

  const entries = await readdir(inputDirectory, { withFileTypes: true });
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".json")
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (jsonFiles.length === 0) {
    console.log(`No JSON files found in ${inputDirectory}`);
    return;
  }

  let hasErrors = false;

  await withPdfPage(async (page) => {
    for (const fileName of jsonFiles) {
      const inputPath = path.join(inputDirectory, fileName);
      const outputPath = resolveOutputPath(inputPath, outputDirectory);

      try {
        const rawRecipe = await Bun.file(inputPath).json();
        const recipe = parseRecipe(rawRecipe);
        const html = renderRecipeHtml(recipe);

        await renderPdfFromPage(page, html, outputPath);
        console.log(`PDF generated: ${outputPath}`);
      } catch (error) {
        hasErrors = true;
        console.error(`Failed to generate PDF for ${inputPath}:`, error);
      }
    }
  });

  if (hasErrors) {
    process.exit(1);
  }
}

await main();
