import type { Recipe } from "./types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderItems(items: string[], tagName: "ul" | "ol"): string {
  const itemMarkup = items
    .map((item) => `<li class="mb-2 last:mb-0">${escapeHtml(item)}</li>`)
    .join("\n");

  const listClass =
    tagName === "ul"
      ? "list-disc pl-6 text-[12pt] leading-6 text-stone-800"
      : "list-decimal pl-6 text-[12pt] leading-6 text-stone-800";

  return `<${tagName} class="${listClass}">${itemMarkup}</${tagName}>`;
}

export function renderRecipeHtml(recipe: Recipe): string {
  const note = recipe.note ? escapeHtml(recipe.note) : "Aucune note.";
  const portions = recipe.portions === null ? "Portions non indiquees" : `${recipe.portions} portion${recipe.portions > 1 ? "s" : ""}`;

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(recipe.title)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
    </style>
  </head>
  <body class="bg-white text-stone-900 antialiased">
    <main class="mx-auto flex min-h-[10in] w-full max-w-none flex-col gap-8 bg-white px-8 py-8 font-serif">
      <header class="border-b border-stone-300 pb-5">
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="mb-2 text-[10pt] font-semibold uppercase tracking-[0.2em] text-stone-500">Recette</p>
            <h1 class="text-[24pt] font-semibold leading-tight text-stone-900">${escapeHtml(recipe.title)}</h1>
          </div>
          <div class="shrink-0 rounded border border-stone-300 px-4 py-2 text-right">
            <p class="text-[9pt] uppercase tracking-[0.18em] text-stone-500">Portions</p>
            <p class="text-[12pt] font-medium text-stone-900">${escapeHtml(portions)}</p>
          </div>
        </div>
      </header>

      <section class="recipe-section">
        <h2 class="mb-3 text-[11pt] font-semibold uppercase tracking-[0.2em] text-stone-500">Ingredients</h2>
        ${renderItems(recipe.ingredients, "ul")}
      </section>

      <section class="recipe-section">
        <h2 class="mb-3 text-[11pt] font-semibold uppercase tracking-[0.2em] text-stone-500">Instructions</h2>
        ${renderItems(recipe.instructions, "ol")}
      </section>

      <section class="recipe-section border-t border-stone-200 pt-5">
        <h2 class="mb-3 text-[11pt] font-semibold uppercase tracking-[0.2em] text-stone-500">Notes</h2>
        <p class="text-[12pt] leading-6 text-stone-800">${note}</p>
      </section>
    </main>
  </body>
</html>`;
}
