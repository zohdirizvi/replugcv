"use client";

import { Plus } from "@untitledui/icons";

type AddEntryButtonProps = {
  onClick: () => void;
  label?: string;
};

export function AddEntryButton({ onClick, label = "Add entry" }: AddEntryButtonProps) {
  return (
    <div className="mt-2 opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="w-full flex items-center justify-center gap-1 rounded-md border border-dashed border-[#059669]/40 bg-[#059669]/5 py-1 text-[10px] font-medium text-[#059669] cursor-pointer hover:bg-[#059669]/10 hover:border-[#059669]/60 transition-all"
        title={label}
      >
        <Plus className="size-3" />
        {label}
      </button>
    </div>
  );
}
