export type Recipe = {
  title: string;
  ingredients: string[];
  instructions: string[];
  note: string | null;
  portions: number | null;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseRecipe(value: unknown): Recipe {
  if (!value || typeof value !== "object") {
    throw new Error("Recipe JSON must be an object.");
  }

  const recipe = value as Record<string, unknown>;

  if (typeof recipe.title !== "string") {
    throw new Error("Recipe title must be a string.");
  }

  if (!isStringArray(recipe.ingredients)) {
    throw new Error("Recipe ingredients must be an array of strings.");
  }

  if (!isStringArray(recipe.instructions)) {
    throw new Error("Recipe instructions must be an array of strings.");
  }

  if (recipe.note !== null && typeof recipe.note !== "string") {
    throw new Error("Recipe note must be a string or null.");
  }

  if (recipe.portions !== null && !Number.isInteger(recipe.portions)) {
    throw new Error("Recipe portions must be an integer or null.");
  }

  return {
    title: recipe.title,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    note: recipe.note,
    portions: recipe.portions as number | null,
  };
}
