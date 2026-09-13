import { useEffect, useMemo, useRef, useState } from "react";
import CompareToggle from "./components/CompareToggle";
import DownloadButton from "./components/DownloadButton";
import FineTunePanel from "./components/FineTunePanel";
import ImageEditor from "./components/ImageEditor";
import ImagePreview from "./components/ImagePreview";
import ImageUploader from "./components/ImageUploader";
import IntensitySlider from "./components/IntensitySlider";
import PresetSelector from "./components/PresetSelector";
import ResetEditsButton from "./components/ResetEditsButton";
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

  useEffect(() => {
    if (!hasImage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [hasImage]);

  const resetEdits = () => {
    setSelectedPresetId(DEFAULT_PRESET_ID);
    setIntensity(50);
    setTweaks(IDENTITY_TWEAKS);
    setIsShowingOriginal(false);
  };

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
      resetEdits();
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
              加工はすべてブラウザ内で完結します。
            </p>
          </header>
          <section className="overflow-hidden rounded-3xl border border-white/8 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <ImageUploader onFile={handleFile} disabled={isProcessing} />
          </section>
          {error ? <p className="mt-4 text-center text-sm text-rose-300">{error}</p> : null}
          <p className="mt-4 text-center text-xs text-stone-500">JPEG / PNG / WebP ・ 最大プレビュー 1920px</p>
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
          <div className="flex items-center justify-between px-4 py-2 lg:px-5 lg:py-3">
            <p className="font-display text-xs tracking-[0.32em] text-amber-200/70 lg:text-sm">EMO</p>
            <button
              type="button"
              className="text-[11px] tracking-wide text-stone-400 underline-offset-4 hover:text-stone-200 hover:underline"
              onClick={() => {
                resetEdits();
                setHasImage(false);
                setError(null);
              }}
            >
              別の写真
            </button>
          </div>
          <div className="relative min-h-0 flex-1 px-2 pb-2 lg:px-4 lg:pb-4">
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/8">
              <ImagePreview
                sourceRef={sourceCanvasRef}
                outputRef={outputCanvasRef}
                isShowingOriginal={isShowingOriginal}
                version={previewVersion}
              />
              <div className="absolute inset-x-3 bottom-3 z-10">
                <CompareToggle isShowingOriginal={isShowingOriginal} onChange={setIsShowingOriginal} />
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col lg:w-[min(46vw,640px)] lg:flex-none">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 lg:px-6 lg:py-5">
            <div className="flex flex-col gap-4 lg:gap-5">
              {error ? <p className="text-center text-sm text-rose-300">{error}</p> : null}
              <ResetEditsButton onReset={resetEdits} />
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
              <FineTunePanel tweaks={tweaks} onChange={setTweaks} />
              <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                <DownloadButton disabled={!hasImage} onDownload={handleDownload} />
              </div>
            </div>
          </div>
        </section>
      </div>
      <ImageEditor sourceRef={sourceCanvasRef} outputRef={outputCanvasRef} />
    </div>
  );
}
