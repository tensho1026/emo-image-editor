export type Recipe = {
  id: string;
  name: string;
  createdAt: number;
  presetId: string;
  intensity: number;
  tweaks: Record<string, number>;
};

const STORAGE_KEY = "emo-recipes-v1";

export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Recipe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function recipeToJson(recipe: Recipe): string {
  return JSON.stringify(recipe, null, 2);
}

export function parseRecipeJson(text: string): Recipe | null {
  try {
    const parsed = JSON.parse(text) as Recipe;
    if (!parsed || typeof parsed.name !== "string" || typeof parsed.presetId !== "string") return null;
    if (typeof parsed.intensity !== "number" || !parsed.tweaks) return null;
    return {
      id: parsed.id || `${Date.now()}`,
      name: parsed.name,
      createdAt: parsed.createdAt || Date.now(),
      presetId: parsed.presetId,
      intensity: parsed.intensity,
      tweaks: parsed.tweaks,
    };
  } catch {
    return null;
  }
}
