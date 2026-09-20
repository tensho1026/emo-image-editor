import { useState } from "react";
import type { Recipe } from "../utils/recipes";
import { parseRecipeJson, recipeToJson } from "../utils/recipes";

type RecipePanelProps = {
  recipes: Recipe[];
  onSave: (name: string) => void;
  onApply: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onImport: (recipe: Recipe) => void;
};

export default function RecipePanel({ recipes, onSave, onApply, onDelete, onImport }: RecipePanelProps) {
  const [name, setName] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-white/8 px-3 py-3">
      <h2 className="mb-2 text-xs tracking-[0.28em] text-stone-400 uppercase">Recipes</h2>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="レシピ名"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-stone-100 outline-none"
        />
        <button
          type="button"
          className="shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-xs text-stone-900"
          onClick={() => {
            const trimmed = name.trim();
            if (!trimmed) return;
            onSave(trimmed);
            setName("");
            setMessage("保存しました");
          }}
        >
          保存
        </button>
      </div>

      <div className="mt-2 flex max-h-28 flex-col gap-1 overflow-y-auto">
        {recipes.length === 0 ? <p className="text-[11px] text-stone-500">まだ保存したレシピはありません</p> : null}
        {recipes.map((recipe) => (
          <div key={recipe.id} className="flex items-center gap-2 text-sm">
            <button type="button" className="min-w-0 flex-1 truncate text-left text-stone-200" onClick={() => onApply(recipe)}>
              {recipe.name}
            </button>
            <button
              type="button"
              className="text-[11px] text-stone-500"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(recipeToJson(recipe));
                  setMessage("JSONをコピーしました");
                } catch {
                  setMessage("コピーできませんでした");
                }
              }}
            >
              コピー
            </button>
            <button type="button" className="text-[11px] text-rose-300/80" onClick={() => onDelete(recipe.id)}>
              削除
            </button>
          </div>
        ))}
      </div>

      <textarea
        value={jsonText}
        onChange={(event) => setJsonText(event.target.value)}
        placeholder="JSONを貼って読み込み"
        className="mt-2 h-16 w-full rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 text-[11px] text-stone-300 outline-none"
      />
      <button
        type="button"
        className="mt-1 text-[11px] text-amber-100/80"
        onClick={() => {
          const recipe = parseRecipeJson(jsonText);
          if (!recipe) {
            setMessage("JSONを読めませんでした");
            return;
          }
          onImport(recipe);
          setJsonText("");
          setMessage("読み込みました");
        }}
      >
        JSONを読み込む
      </button>
      {message ? <p className="mt-1 text-[11px] text-stone-500">{message}</p> : null}
    </section>
  );
}
