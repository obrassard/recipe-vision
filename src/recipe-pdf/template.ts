import type { Recipe } from "./types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderItems(items: string[], tagName: "ul" | "ol", className?: string): string {
  const itemSpacing = tagName === "ol" ? "mb-3" : "mb-2";
  const itemMarkup = items
    .map((item) => `<li class="${itemSpacing} last:mb-0 break-inside-avoid [-webkit-column-break-inside:avoid] [page-break-inside:avoid]">${escapeHtml(item)}</li>`)
    .join("\n");

  const listClass =
    tagName === "ul"
      ? "list-disc pl-5 text-[10.5pt] leading-5 text-stone-800"
      : "list-decimal pl-5 text-[10.5pt] leading-5 text-stone-800";

  const classes = className ? `${listClass} ${className}` : listClass;
  return `<${tagName} class="${classes}">${itemMarkup}</${tagName}>`;
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
            <h1 class="text-[22pt] font-semibold leading-tight text-stone-900">${escapeHtml(recipe.title)}</h1>
          </div>
          ${portionsMarkup}
        </div>
      </header>

      <section class="recipe-section">
        <h2 class="mb-4 text-[16pt] italic font-bold tracking-[0.05em] text-center text-teal-800">Ingrédients</h2>
        ${renderItems(recipe.ingredients, "ul", "columns-2 gap-12 [column-fill:_balance]")}
      </section>

      <section class="recipe-section mt-2">
        <h2 class="mb-4 text-[16pt] italic font-bold tracking-[0.05em] text-center text-teal-800">Instructions</h2>
        ${renderItems(recipe.instructions, "ol")}
      </section>

      <section class="recipe-section mt-1 rounded-lg border border-stone-200 p-4">
        <h2 class="mb-2 text-[12pt] italic font-bold tracking-[0.05em] text-teal-800">Notes</h2>
        <p class="text-[10.5pt] leading-5 text-stone-800">${note}</p>
      </section>
    </main>
  </body>
</html>`;
}
