type ResetEditsButtonProps = {
  onReset: () => void;
};

export default function ResetEditsButton({ onReset }: ResetEditsButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="w-full rounded-full border border-white/15 py-2.5 text-sm text-stone-200 transition hover:border-amber-100/40 hover:text-amber-50"
    >
      編集をリセット
    </button>
  );
}
