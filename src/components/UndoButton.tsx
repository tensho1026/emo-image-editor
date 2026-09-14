type UndoButtonProps = {
  disabled?: boolean;
  onUndo: () => void;
};

export default function UndoButton({ disabled, onUndo }: UndoButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onUndo}
      className="w-full rounded-full border border-white/15 py-2.5 text-sm text-stone-200 disabled:opacity-35"
    >
      ひとつ戻る
    </button>
  );
}
