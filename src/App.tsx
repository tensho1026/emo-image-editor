import { useEffect, useMemo, useRef, useState } from "react";
import AddImagesButton from "./components/AddImagesButton";
import AdjustSection from "./components/AdjustSection";
import CropBar from "./components/CropBar";
import DownloadButton from "./components/DownloadButton";
import ExportSizeSelect from "./components/ExportSizeSelect";
import ImageEditor from "./components/ImageEditor";
import ImagePreview from "./components/ImagePreview";
import ImageStrip from "./components/ImageStrip";
import ImageUploader from "./components/ImageUploader";
import IntensitySlider from "./components/IntensitySlider";
import PresetSelector from "./components/PresetSelector";
import RecipePanel from "./components/RecipePanel";
import ResetEditsButton from "./components/ResetEditsButton";
import UndoButton from "./components/UndoButton";
import { DEFAULT_PRESET_ID, IDENTITY_TWEAKS, presets } from "./presets/presets";
import type { AppliedFilters, ExportSize } from "./types/preset";
import type { BatchItem } from "./types/batch";
import { createBatchItem, copyCanvas, uniqueDownloadName, editedThumbUrl } from "./utils/batch";
import { applyIntensity, combineFilters, renderEditedImage } from "./utils/filters";
import { canvasToBlob, downloadBlob, loadImageFromFile } from "./utils/image";
import { createZip } from "./utils/zip";
import { ASPECT_OPTIONS, FULL_CROP, aspectCrop, clampCrop, extractCrop, type AspectId, type CropRect } from "./utils/crop";
import { buildExportCanvas } from "./utils/export";
import { loadRecipes, saveRecipes, type Recipe } from "./utils/recipes";

const MAX_BATCH = 30;

type Snapshot = {
  selectedPresetId: string;
  intensity: number;
  tweaks: AppliedFilters;
  crops: Record<string, CropRect>;
};

function showItemOnCanvases(
  item: BatchItem,
  source: HTMLCanvasElement,
  output: HTMLCanvasElement,
  filters: AppliedFilters,
  crop: CropRect,
): void {
  const cropped = extractCrop(item.source, crop);
  copyCanvas(cropped, source);
  renderEditedImage(cropped, output, filters, 1);
}

export default function App() {
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  const [items, setItems] = useState<BatchItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState(DEFAULT_PRESET_ID);
  const [intensity, setIntensity] = useState(50);
  const [tweaks, setTweaks] = useState(IDENTITY_TWEAKS);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [split, setSplit] = useState(50);
  const [cropMode, setCropMode] = useState(false);
  const [aspect, setAspect] = useState<AspectId>("free");
  const [crops, setCrops] = useState<Record<string, CropRect>>({});
  const [exportSize, setExportSize] = useState<ExportSize>("original");
  const [presetThumbs, setPresetThumbs] = useState<Record<string, string>>({});
  const [recipes, setRecipes] = useState<Recipe[]>(() => (typeof window === "undefined" ? [] : loadRecipes()));
  const [history, setHistory] = useState<Snapshot | null>(null);

  const hasImage = items.length > 0;
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];
  const activeCrop = activeItem ? (crops[activeItem.id] ?? FULL_CROP) : FULL_CROP;

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? presets[0],
    [selectedPresetId],
  );

  const filters = useMemo(
    () => combineFilters(applyIntensity(selectedPreset, intensity), tweaks),
    [selectedPreset, intensity, tweaks],
  );

  const snapshotRef = useRef<Snapshot>({
    selectedPresetId,
    intensity,
    tweaks,
    crops,
  });
  snapshotRef.current = { selectedPresetId, intensity, tweaks, crops };

  const commit = () => setHistory(snapshotRef.current);

  const rerender = () => {
    const source = sourceCanvasRef.current;
    const output = outputCanvasRef.current;
    if (!source || !output || !activeItem) return;
    const cropForView = cropMode ? FULL_CROP : activeCrop;
    showItemOnCanvases(activeItem, source, output, filters, cropForView);
    setPreviewVersion((value) => value + 1);
  };

  useEffect(() => {
    if (!hasImage) return;
    const id = window.requestAnimationFrame(rerender);
    return () => window.cancelAnimationFrame(id);
  }, [filters, hasImage, activeId, activeCrop, cropMode]);

  useEffect(() => {
    if (!hasImage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [hasImage]);

  useEffect(() => {
    if (!hasImage || !activeItem) return;
    const handle = window.setTimeout(() => {
      const next: Record<string, string> = {};
      for (const preset of presets) {
        next[preset.id] = editedThumbUrl(activeItem.source, activeCrop, applyIntensity(preset, 50));
      }
      setPresetThumbs(next);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [hasImage, activeItem?.id, activeCrop]);

  useEffect(() => {
    if (!hasImage) return;
    const handle = window.setTimeout(() => {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          thumbUrl: editedThumbUrl(item.source, crops[item.id] ?? FULL_CROP, filters),
        })),
      );
    }, 280);
    return () => window.clearTimeout(handle);
  }, [filters, hasImage, crops]);

  const resetEdits = () => {
    commit();
    setSelectedPresetId(DEFAULT_PRESET_ID);
    setIntensity(50);
    setTweaks(IDENTITY_TWEAKS);
    setSplit(50);
  };

  const undo = () => {
    if (!history) return;
    setSelectedPresetId(history.selectedPresetId);
    setIntensity(history.intensity);
    setTweaks(history.tweaks);
    setCrops(history.crops);
    setHistory(null);
  };

  const clearBatch = () => {
    resetEdits();
    setItems([]);
    setActiveId(null);
    setCrops({});
    setCropMode(false);
    setError(null);
  };

  const handleFiles = async (files: File[], mode: "replace" | "append") => {
    setError(null);
    setIsProcessing(true);
    try {
      const room = mode === "replace" ? MAX_BATCH : Math.max(0, MAX_BATCH - items.length);
      const selected = files.slice(0, room);
      if (selected.length === 0) {
        setError(`一度に扱えるのは ${MAX_BATCH} 枚までです`);
        return;
      }

      const nextItems: BatchItem[] = [];
      for (const file of selected) {
        const image = await loadImageFromFile(file);
        nextItems.push(createBatchItem(image, file.name));
      }

      const source = sourceCanvasRef.current;
      const output = outputCanvasRef.current;
      const nextCrops = { ...crops };

      if (mode === "replace") {
        const fresh: Record<string, CropRect> = {};
        for (const item of nextItems) fresh[item.id] = FULL_CROP;
        setItems(nextItems);
        setActiveId(nextItems[0].id);
        setCrops(fresh);
        setSelectedPresetId(DEFAULT_PRESET_ID);
        setIntensity(50);
        setTweaks(IDENTITY_TWEAKS);
        setSplit(50);
        if (source && output) {
          showItemOnCanvases(nextItems[0], source, output, filters, FULL_CROP);
        }
      } else {
        for (const item of nextItems) nextCrops[item.id] = FULL_CROP;
        const merged = [...items, ...nextItems];
        setItems(merged);
        setCrops(nextCrops);
        if (!activeId) setActiveId(nextItems[0].id);
        if (source && output && activeItem) {
          showItemOnCanvases(activeItem, source, output, filters, crops[activeItem.id] ?? FULL_CROP);
        }
      }

      if (files.length > selected.length) {
        setError(`${MAX_BATCH} 枚まで読み込みました。残りは追加できません`);
      }
      setPreviewVersion((value) => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "読み込みに失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (format: "image/jpeg" | "image/png") => {
    const extension = format === "image/png" ? "png" : "jpg";
    const quality = format === "image/jpeg" ? 0.92 : undefined;

    try {
      if (items.length === 1) {
        const item = items[0];
        const canvas = buildExportCanvas(item, crops[item.id] ?? FULL_CROP, filters, exportSize);
        const blob = await canvasToBlob(canvas, format, quality);
        downloadBlob(blob, `${item.name}-${selectedPreset.id}.${extension}`);
        return;
      }

      const zipEntries: { name: string; data: Uint8Array }[] = [];
      const used = new Set<string>();

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        setExportProgress(`${index + 1}/${items.length}`);
        const canvas = buildExportCanvas(item, crops[item.id] ?? FULL_CROP, filters, exportSize);
        const blob = await canvasToBlob(canvas, format, quality);
        const data = new Uint8Array(await blob.arrayBuffer());
        const name = uniqueDownloadName(`${item.name}-${selectedPreset.id}`, used, extension);
        zipEntries.push({ name, data });
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
      }

      const zip = createZip(zipEntries);
      downloadBlob(zip, `emo-${selectedPreset.id}-${items.length}photos.zip`);
    } finally {
      setExportProgress(null);
      const source = sourceCanvasRef.current;
      const output = outputCanvasRef.current;
      if (source && output && activeItem) {
        showItemOnCanvases(activeItem, source, output, filters, activeCrop);
        setPreviewVersion((value) => value + 1);
      }
    }
  };

  const applyAspect = (id: AspectId) => {
    if (!activeItem) return;
    commit();
    setAspect(id);
    const option = ASPECT_OPTIONS.find((item) => item.id === id);
    const next =
      !option || option.id === "free" || option.id === "original" || option.value === null
        ? FULL_CROP
        : aspectCrop(activeItem.source.width, activeItem.source.height, option.value);
    setCrops((current) => ({ ...current, [activeItem.id]: next }));
  };

  const persistRecipes = (next: Recipe[]) => {
    setRecipes(next);
    saveRecipes(next);
  };

  if (!hasImage) {
    return (
      <div className="relative min-h-dvh overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 grain-overlay" />
        <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-10 pt-8 sm:max-w-xl sm:pt-12">
          <header className="mb-8 text-center">
            <p className="font-display text-sm tracking-[0.35em] text-amber-200/70">EMO</p>
            <h1 className="font-display mt-2 text-4xl italic text-stone-100 sm:text-5xl">Drop your memory</h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              普通の写真を、記憶の中の写真のような雰囲気に。
              <br />
              複数枚でも、同じ設定でまとめて加工できます。
            </p>
          </header>
          <section className="overflow-hidden rounded-3xl border border-white/8 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <ImageUploader onFiles={(files) => handleFiles(files, "replace")} disabled={isProcessing} />
          </section>
          {error ? <p className="mt-4 text-center text-sm text-rose-300">{error}</p> : null}
          <p className="mt-4 text-center text-xs text-stone-500">JPEG / PNG / WebP ・ 最大 {MAX_BATCH} 枚</p>
        </div>
        <ImageEditor sourceRef={sourceCanvasRef} outputRef={outputCanvasRef} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grain-overlay" />
      <div className="relative flex h-full min-h-0 flex-col lg:flex-row">
        <section className="flex h-[42dvh] min-h-[220px] shrink-0 flex-col border-b border-white/8 bg-black/30 lg:h-full lg:min-h-0 lg:flex-1 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-4 py-2 lg:px-5 lg:py-3">
            <p className="font-display text-xs tracking-[0.32em] text-amber-200/70 lg:text-sm">EMO</p>
            <p className="min-w-0 truncate text-[11px] text-stone-400">
              {items.length}枚・同じ設定
              {items.length > 1 ? ` ・ ${items.findIndex((item) => item.id === activeItem.id) + 1}/${items.length}` : ""}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <AddImagesButton disabled={isProcessing || items.length >= MAX_BATCH} onFiles={(files) => handleFiles(files, "append")} />
              <button
                type="button"
                className="text-[11px] tracking-wide text-stone-400 underline-offset-4 hover:text-stone-200 hover:underline"
                onClick={clearBatch}
              >
                別の写真
              </button>
            </div>
          </div>
          <div className="relative min-h-0 flex-1 px-2 pb-2 lg:px-4 lg:pb-4">
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/8">
              <ImagePreview
                sourceRef={sourceCanvasRef}
                outputRef={outputCanvasRef}
                version={previewVersion}
                split={split}
                onSplitChange={setSplit}
                cropMode={cropMode}
                crop={activeCrop}
                onCropChange={(crop) => {
                  if (!activeItem) return;
                  setCrops((current) => ({ ...current, [activeItem.id]: clampCrop(crop) }));
                }}
              />
            </div>
          </div>
          <ImageStrip items={items} activeId={activeItem.id} onSelect={setActiveId} />
        </section>

        <section className="flex min-h-0 flex-1 flex-col lg:w-[min(46vw,640px)] lg:flex-none">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 lg:px-6 lg:py-5">
            <div className="flex flex-col gap-4 lg:gap-5">
              {error ? <p className="text-center text-sm text-rose-300">{error}</p> : null}
              <div className="grid grid-cols-2 gap-2">
                <ResetEditsButton onReset={resetEdits} />
                <UndoButton disabled={!history} onUndo={undo} />
              </div>
              <PresetSelector
                presets={presets}
                selectedId={selectedPresetId}
                thumbs={presetThumbs}
                onSelect={(id) => {
                  commit();
                  setSelectedPresetId(id);
                  setTweaks(IDENTITY_TWEAKS);
                }}
              />
              <IntensitySlider value={intensity} onChange={setIntensity} />
              <CropBar
                cropMode={cropMode}
                aspect={aspect}
                onToggle={() => setCropMode((value) => !value)}
                onAspect={applyAspect}
              />
              <AdjustSection tweaks={tweaks} onChange={setTweaks} />
              <RecipePanel
                recipes={recipes}
                onSave={(name) => {
                  const recipe: Recipe = {
                    id: `${Date.now()}`,
                    name,
                    createdAt: Date.now(),
                    presetId: selectedPresetId,
                    intensity,
                    tweaks,
                  };
                  persistRecipes([recipe, ...recipes].slice(0, 40));
                }}
                onApply={(recipe) => {
                  commit();
                  setSelectedPresetId(recipe.presetId);
                  setIntensity(recipe.intensity);
                  setTweaks({ ...IDENTITY_TWEAKS, ...recipe.tweaks });
                }}
                onDelete={(id) => persistRecipes(recipes.filter((recipe) => recipe.id !== id))}
                onImport={(recipe) => persistRecipes([recipe, ...recipes.filter((item) => item.id !== recipe.id)].slice(0, 40))}
              />
              <ExportSizeSelect value={exportSize} onChange={setExportSize} />
              <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                <DownloadButton
                  disabled={!hasImage}
                  count={items.length}
                  progress={exportProgress}
                  onDownload={handleDownload}
                />
                {items.length > 1 ? (
                  <p className="mt-2 text-center text-[11px] text-stone-500">同じ設定で全枚をZIPにまとめて保存します</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
      <ImageEditor sourceRef={sourceCanvasRef} outputRef={outputCanvasRef} />
    </div>
  );
}
