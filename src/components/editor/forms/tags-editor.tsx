"use client";

import { useState } from "react";
import { Plus, X } from "@untitledui/icons";

export function TagsEditor({
  items,
  onChange,
  label,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {items.map((skill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/8 px-2.5 py-1 text-xs font-medium text-[#8B5CF6]"
          >
            {skill}
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="flex size-4 items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-[#8B5CF6]/60 hover:text-[#8B5CF6]"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          placeholder={`Add ${label.toLowerCase()}...`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="flex-1 h-9 rounded-lg border border-secondary bg-primary px-3 text-sm text-primary outline-none transition-colors focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 placeholder:text-quaternary"
        />
        <button
          onClick={add}
          className="flex size-9 items-center justify-center rounded-lg border border-secondary bg-primary text-fg-quaternary cursor-pointer hover:text-[#8B5CF6] hover:border-[#8B5CF6]/40 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
