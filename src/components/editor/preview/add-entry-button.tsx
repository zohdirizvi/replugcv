"use client";

/**
 * AddEntryButton — Enhancv-style "+" circle at center-bottom of section.
 * Only rendered when section is selected (controlled by parent).
 * 24px circle, subtle green, centered.
 */
export function AddEntryButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <div className="flex justify-center mt-2">
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="flex items-center justify-center size-6 rounded-full border border-[#059669]/40 bg-white text-[#059669] cursor-pointer hover:bg-[#059669] hover:text-white hover:border-[#059669] transition-all shadow-sm"
        title={label}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
