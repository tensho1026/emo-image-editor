import { useEffect, useMemo, useRef, useState } from "react";
import CompareToggle from "./components/CompareToggle";
import DownloadButton from "./components/DownloadButton";
import FineTunePanel from "./components/FineTunePanel";
import ImageEditor from "./components/ImageEditor";
import ImagePreview from "./components/ImagePreview";
import ImageUploader from "./components/ImageUploader";
import IntensitySlider from "./components/IntensitySlider";
import PresetSelector from "./components/PresetSelector";
import { DEFAULT_PRESET_ID, IDENTITY_TWEAKS, presets } from "./presets/presets";
import { applyIntensity, combineFilters, renderEditedImage } from "./utils/filters";
import { canvasToBlob, downloadBlob, drawToPreviewCanvas, loadImageFromFile } from "./utils/image";

export default function App() {
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  const [hasImage, setHasImage] = useState(false);
  const [fileName, setFileName] = useState("memory");
  const [selectedPresetId, setSelectedPresetId] = useState(DEFAULT_PRESET_ID);
  const [intensity, setIntensity] = useState(50);
  const [tweaks, setTweaks] = useState(IDENTITY_TWEAKS);
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? presets[0],
    [selectedPresetId],
  );

  const filters = useMemo(
    () => combineFilters(applyIntensity(selectedPreset, intensity), tweaks),
    [selectedPreset, intensity, tweaks],
  );

  const rerender = () => {
    const source = sourceCanvasRef.current;
    const output = outputCanvasRef.current;
    if (!source || !output || source.width === 0) return;
    renderEditedImage(source, output, filters);
    setPreviewVersion((value) => value + 1);
  };

  useEffect(() => {
    if (!hasImage) return;
    const id = window.requestAnimationFrame(rerender);
    return () => window.cancelAnimationFrame(id);
  }, [filters, hasImage]);

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    try {
      const image = await loadImageFromFile(file);
      const source = sourceCanvasRef.current;
      const output = outputCanvasRef.current;
      if (!source || !output) return;
      drawToPreviewCanvas(image, source);
      renderEditedImage(source, output, filters);
      setFileName(file.name.replace(/\.[^.]+$/, "") || "memory");
      setHasImage(true);
      setIsShowingOriginal(false);
      setPreviewVersion((value) => value + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "読み込みに失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (format: "image/jpeg" | "image/png") => {
    const canvas = isShowingOriginal ? sourceCanvasRef.current : outputCanvasRef.current;
    if (!canvas) return;
    const extension = format === "image/png" ? "png" : "jpg";
    const blob = await canvasToBlob(canvas, format, format === "image/jpeg" ? 0.92 : undefined);
    downloadBlob(blob, `${fileName}-${selectedPreset.id}.${extension}`);
  };

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
            加工はすべてブラウザ内で完結します。
          </p>
        </header>

        <main className="flex flex-1 flex-col gap-6">
          <section className="overflow-hidden rounded-3xl border border-white/8 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            {hasImage ? (
              <ImagePreview
                sourceRef={sourceCanvasRef}
                outputRef={outputCanvasRef}
                isShowingOriginal={isShowingOriginal}
                version={previewVersion}
              />
            ) : (
              <ImageUploader onFile={handleFile} disabled={isProcessing} />
            )}
          </section>

          {error ? <p className="text-center text-sm text-rose-300">{error}</p> : null}

          {hasImage ? (
            <>
              <CompareToggle isShowingOriginal={isShowingOriginal} onChange={setIsShowingOriginal} />
              <PresetSelector
                presets={presets}
                selectedId={selectedPresetId}
                onSelect={(id) => {
                  setSelectedPresetId(id);
                  setTweaks(IDENTITY_TWEAKS);
                  setIsShowingOriginal(false);
                }}
              />
              <IntensitySlider value={intensity} onChange={setIntensity} />
              <FineTunePanel tweaks={tweaks} onChange={setTweaks} onReset={() => setTweaks(IDENTITY_TWEAKS)} />
              <DownloadButton disabled={!hasImage} onDownload={handleDownload} />
              <button
                type="button"
                className="text-center text-xs tracking-wide text-stone-500 underline-offset-4 hover:text-stone-300 hover:underline"
                onClick={() => {
                  setHasImage(false);
                  setError(null);
                }}
              >
                別の写真を選ぶ
              </button>
            </>
          ) : (
            <p className="text-center text-xs text-stone-500">JPEG / PNG / WebP ・ 最大プレビュー 1920px</p>
          )}
        </main>
      </div>

      <ImageEditor sourceRef={sourceCanvasRef} outputRef={outputCanvasRef} />
    </div>
  );
}
