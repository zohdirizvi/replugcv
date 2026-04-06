"use client";

/**
 * AddEntryButton — subtle "+" circle at center-bottom of section.
 * Only visible when section is hovered/selected (via group/section).
 * Inspired by Enhancv: doesn't pollute resume layout.
 */
export function AddEntryButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <div className="flex justify-center mt-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="flex items-center justify-center size-5 rounded-full border border-dashed border-[#059669]/50 bg-white text-[#059669] cursor-pointer hover:bg-[#059669]/10 hover:border-[#059669] transition-all"
        title={label}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
