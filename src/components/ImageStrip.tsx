import type { BatchItem } from "../types/batch";

type ImageStripProps = {
  items: BatchItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function ImageStrip({ items, activeId, onSelect }: ImageStripProps) {
  if (items.length < 2) return null;

  return (
    <div className="shrink-0 px-2 pb-2 lg:px-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              title={item.name}
              onClick={() => onSelect(item.id)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${
                selected ? "border-amber-200" : "border-white/15 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={item.thumbUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-0 right-0 bg-black/55 px-1 text-[9px] text-stone-200">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
