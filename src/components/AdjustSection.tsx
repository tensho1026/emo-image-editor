import type { AppliedFilters } from "../types/preset";
import { useState } from "react";
import FineTunePanel from "./FineTunePanel";

type Props = {
  tweaks: AppliedFilters;
  onChange: (tweaks: AppliedFilters) => void;
};

export default function AdjustSection({ tweaks, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-3 py-2 text-left lg:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-xs tracking-[0.28em] text-stone-400 uppercase">詳細調整</span>
        <span className="text-xs text-stone-500">{open ? "閉じる" : "開く"}</span>
      </button>
      <div className={`mt-3 ${open ? "block" : "hidden"} lg:mt-0 lg:block`}>
        <FineTunePanel tweaks={tweaks} onChange={onChange} />
      </div>
    </section>
  );
}
