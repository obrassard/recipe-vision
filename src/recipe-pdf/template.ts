import type { Recipe } from "./types";

type RecipeSection = {
  title: string | null;
  items: string[];
};

const SECTION_MARKER_PATTERN = /^\[(.+)\]$/;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSectionTitle(item: string): string | null {
  const match = item.trim().match(SECTION_MARKER_PATTERN);
  return match ? match[1].trim() : null;
}

function splitIntoSections(items: string[]): RecipeSection[] {
  const sections: RecipeSection[] = [];
  let currentSection: RecipeSection = { title: null, items: [] };

  for (const item of items) {
    const sectionTitle = getSectionTitle(item);

    if (sectionTitle !== null) {
      if (currentSection.title !== null || currentSection.items.length > 0) {
        sections.push(currentSection);
      }

      currentSection = {
        title: sectionTitle,
        items: [],
      };
      continue;
    }

    currentSection.items.push(item);
  }

  if (currentSection.title !== null || currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

function renderItems(items: string[], tagName: "ul" | "ol", className?: string): string {
  const itemSpacing = tagName === "ol" ? "mb-2" : "mb-1/2";
  const itemMarkup = items
    .map((item) => `<li class="${itemSpacing} last:mb-0 break-inside-avoid [-webkit-column-break-inside:avoid] [page-break-inside:avoid]">${escapeHtml(item)}</li>`)
    .join("\n");

  const listClass =
    tagName === "ul"
      ? "list-disc pl-5 text-[9pt] leading-5 text-stone-800"
      : "list-decimal pl-5 text-[9pt] leading-5 text-stone-800";

  const classes = className ? `${listClass} ${className}` : listClass;
  return `<${tagName} class="${classes}">${itemMarkup}</${tagName}>`;
}

function renderSectionedItems(items: string[], tagName: "ul" | "ol", listClassName?: string): string {
  const sections = splitIntoSections(items);

  if (sections.length === 1 && sections[0]?.title === null) {
    return renderItems(items, tagName, listClassName);
  }

  return sections
    .filter((section) => section.items.length > 0)
    .map((section) => {
      const titleMarkup = section.title
        ? `<h3 class="mb-3 text-[9pt] font-semibold uppercase tracking-[0.12em] text-teal-800">${escapeHtml(section.title)}</h3>`
        : "";

      return `<div class="mb-5 last:mb-0 break-inside-avoid [page-break-inside:avoid]">
        ${titleMarkup}
        ${renderItems(section.items, tagName, listClassName)}
      </div>`;
    })
    .join("\n");
}

export function renderRecipeHtml(recipe: Recipe): string {
  const note = recipe.note ? escapeHtml(recipe.note) : "Aucune note.";
  const portionsMarkup =
    recipe.portions === null
      ? ""
      : `<div class="shrink-0 rounded border border-stone-300 px-4 py-2 text-right">
            <p class="text-[9pt] uppercase tracking-[0.18em] text-teal-800">Portions</p>
            <p class="text-[12pt] font-medium text-stone-900">${recipe.portions} portion${recipe.portions > 1 ? "s" : ""}</p>
          </div>`;

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(recipe.title)}</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>
      @page {
        size: Letter;
        margin: 0.5in;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: white;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .recipe-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .font-serif {
        font-family: "Libre Baskerville", serif !important;
      }
    </style>
  </head>
  <body class="bg-white text-stone-900 antialiased">
    <main class="mx-auto flex min-h-[10in] w-full max-w-none flex-col gap-5 bg-white px-8 py-6 font-serif">
      <header class="border-b border-stone-300 pb-4">
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="mb-2 text-[10pt] font-semibold uppercase tracking-[0.2em] text-teal-800">Recette</p>
            <h1 class="text-[18pt] font-semibold leading-tight text-stone-900">${escapeHtml(recipe.title)}</h1>
          </div>
          ${portionsMarkup}
        </div>
      </header>

      <section class="recipe-section">
        <h2 class="mb-4 text-[13pt] italic font-bold tracking-[0.05em] text-center text-teal-800">Ingrédients</h2>
        ${renderSectionedItems(recipe.ingredients, "ul", "columns-2 gap-12 [column-fill:_balance]")}
      </section>

      <section class="recipe-section mt-2">
        <h2 class="mb-4 text-[13pt] italic font-bold tracking-[0.05em] text-center text-teal-800">Instructions</h2>
        ${renderSectionedItems(recipe.instructions, "ol")}
      </section>

      <section class="recipe-section mt-1 rounded-lg border border-stone-200 p-4">
        <h2 class="mb-2 text-[11pt] italic font-bold tracking-[0.05em] text-teal-800">Notes</h2>
        <p class="text-[10pt] leading-5 text-stone-800">${note}</p>
      </section>
    </main>
  </body>
</html>`;
}
