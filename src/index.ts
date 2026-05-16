import type { JSONOutputFormat } from "@anthropic-ai/sdk/resources/messages";
import { findImages } from "./images";
import { createImageMessage } from "./claude";
type JsonSchema = JSONOutputFormat["schema"];

export type Recipe = {
  title: string;
  ingredients: string[];
  instructions: string[];
  note: string | null;
  portions: number | null;
};

export const recipeJsonSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      description: "Titre de la recette.",
    },
    ingredients: {
      type: "array",
      description: "Un item par ingredient.",
      items: {
        type: "string",
      },
    },
    instructions: {
      type: "array",
      description: "Un item par etape de preparation.",
      items: {
        type: "string",
      },
    },
    note: {
      description:
        "Note optionnelle ou conseil supplementaire present dans l'image. Utiliser null si absent.",
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    portions: {
      description: "Nombre de portions si specifie, sinon null.",
      anyOf: [{ type: "integer" }, { type: "null" }],
    },
  },
  required: ["title", "ingredients", "instructions", "note", "portions"],
};

const prompt = `
Tu es un assistant culinaire spécialisé dans la transcription numérique de recettes manuscrites en français québécois.

Analyse l'image jointe (photo d'une recette écrite à la main) et produis une transcription fidèle à l'original, sans rien ajouter, omettre ou réinterpréter.

Règles de transcription :
1. Fidélité absolue : ne modifie aucune quantité, ne change aucun ingrédient, n'ajoute ni ne retire d'étapes.
2. Ordre préservé : ingrédients et instructions dans l'ordre exact de la recette.
3. Caractères ambigus : utilise le contexte culinaire pour inférer (ex: "1 t" dans une liste d'ingrédients = "1 tasse"). Si vraiment illisible, garde la meilleure hypothèse plausible.
4. Aucune invention : si la note ou le nombre de portions ne sont pas présents, utilise null. Ne crée pas d'étapes implicites.
5. Langue : conserve le français de la recette originale (incluant régionalismes québécois). Corrige uniquement les fautes d'orthographe évidentes, sans reformuler le style.

Format des ingrédients : "<quantité> <unité> <ingrédient>" en conservant les précisions (ex: "farine tout usage", "beurre fondu").

Standardise les unités avec ces abréviations exactes :
- g (gramme), kg (kilogramme), ml (millilitre), l (litre)
- c. à thé (cuillère à thé), c. à soupe (cuillère à soupe — inclut "cuillère à table")
- t (tasse)
- once (once)
- Pour les unités non listées (pincée, sachet, gousse, etc.), conserve le terme original.

Exemples :
- "2 c. à s. de beurre fondu" → "2 c. à soupe de beurre fondu"
- "1 1/2 tasse farine" → "1 1/2 t de farine"
- "250gr sucre" → "250 g de sucre"
`;

async function main() {
  const repositoryPath = process.argv[2];

  if (!repositoryPath) {
    console.error("Usage: bun run src/index.ts <repository-path>");
    process.exit(1);
  }

  const images = await findImages(repositoryPath);

  if (images.length === 0) {
    console.log("No images found.");
    return;
  }

  console.log(`Found ${images.length} image file(s).`);

  for (const image of images) {
    console.log(`==============================================`);
    const result = await createImageMessage<Recipe>(image, prompt, recipeJsonSchema,{
      model: "claude-opus-4-7",
    });

    if (result === null) {
      console.error(`Failed to extract recipe from image: ${image}`);
      continue;
    }

    // replace the .png or .jpg extension with .json
    const outputPath = image.replace(/\.(png|jpg|jpeg)$/i, ".json");
    await Bun.write(outputPath, JSON.stringify(result, null, 2));
  }
}

await main();
