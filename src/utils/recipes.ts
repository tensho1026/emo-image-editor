import { FILTER_KEYS } from "../config/filters";
import { presets } from "../presets/presets";
import type { AppliedFilters } from "../types/preset";

export type Recipe = {
  id: string;
  name: string;
  createdAt: number;
  presetId: string;
  intensity: number;
  tweaks: Partial<AppliedFilters>;
};

const STORAGE_KEY = "emo-recipes-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeRecipe(value: unknown): Recipe | null {
  if (!isRecord(value) || typeof value.name !== "string" || typeof value.presetId !== "string") return null;
  if (typeof value.intensity !== "number" || !Number.isFinite(value.intensity) || !isRecord(value.tweaks)) return null;
  if (!presets.some((preset) => preset.id === value.presetId)) return null;
  const name = value.name.trim();
  if (!name) return null;

  const tweaks: Partial<AppliedFilters> = {};
  for (const key of FILTER_KEYS) {
    const tweak = value.tweaks[key];
    if (tweak === undefined) continue;
    if (typeof tweak !== "number" || !Number.isFinite(tweak)) return null;
    tweaks[key] = tweak;
  }

  const createdAt = typeof value.createdAt === "number" && Number.isFinite(value.createdAt) ? value.createdAt : Date.now();
  return {
    id: typeof value.id === "string" && value.id ? value.id : `${Date.now()}`,
    name,
    createdAt,
    presetId: value.presetId,
    intensity: Math.min(100, Math.max(0, value.intensity)),
    tweaks,
  };
}

export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRecipe).filter((recipe): recipe is Recipe => recipe !== null);
  } catch {
    return [];
  }
}

export function saveRecipes(recipes: Recipe[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return true;
  } catch {
    return false;
  }
}

export function recipeToJson(recipe: Recipe): string {
  return JSON.stringify(recipe, null, 2);
}

export function parseRecipeJson(text: string): Recipe | null {
  try {
    return normalizeRecipe(JSON.parse(text) as unknown);
  } catch {
    return null;
  }
}
