"use client";

import { useState } from "react";
import { Plus, X } from "@untitledui/icons";

export function BulletEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...bullets, trimmed]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-tertiary">Bullet Points</label>
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 text-xs text-quaternary">&bull;</span>
          <input
            type="text"
            value={b}
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 h-8 rounded-md border border-secondary bg-primary px-2 text-sm text-primary outline-none focus:border-[#8B5CF6]"
          />
          <button
            onClick={() => onChange(bullets.filter((_, j) => j !== i))}
            className="flex size-6 shrink-0 items-center justify-center rounded bg-transparent border-none text-fg-quaternary cursor-pointer hover:text-error-primary mt-1"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          placeholder="Add bullet point..."
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="flex-1 h-8 rounded-md border border-dashed border-secondary bg-primary px-2 text-sm text-primary outline-none focus:border-[#8B5CF6] placeholder:text-quaternary"
        />
        <button
          onClick={add}
          className="flex size-7 items-center justify-center rounded-md bg-transparent border-none text-fg-quaternary cursor-pointer hover:text-[#8B5CF6]"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
