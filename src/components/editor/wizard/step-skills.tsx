"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";

export function StepSkills() {
  const { blocks, updateBlockContent, ensureBlock } = useEditorContext();
  const [draft, setDraft] = useState("");

  const skillsBlock = blocks.find((b) => b.type === "skills");

  useEffect(() => {
    if (!skillsBlock) ensureBlock("skills");
  }, [skillsBlock, ensureBlock]);

  const c = (skillsBlock?.content as Record<string, unknown>) || {};
  const items = (c.items as string[]) || [];

  const setSkills = (next: string[]) => {
    if (!skillsBlock) return;
    updateBlockContent(skillsBlock.id, { ...c, items: next });
  };

  const addSkill = () => {
    const trimmed = draft.trim();
    if (!trimmed || items.includes(trimmed)) return;
    setSkills([...items, trimmed]);
    setDraft("");
  };

  const removeSkill = (idx: number) => {
    setSkills(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <h2 className="text-lg font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
        Skills
      </h2>
      <p className="text-sm text-[#737373] -mt-3">
        Add all relevant skills that showcase your expertise.
      </p>

      {/* Existing skills as pills */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
              style={{ backgroundColor: "#059669/10", background: "rgba(5, 150, 105, 0.08)", color: "#059669" }}
            >
              {skill}
              <button
                onClick={() => removeSkill(i)}
                className="flex size-4 items-center justify-center rounded-full bg-transparent border-none cursor-pointer"
                style={{ color: "#059669" }}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input to add new skill */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          placeholder="Type a skill and press Enter..."
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          className="flex-1 h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
        <button
          onClick={addSkill}
          className="flex size-11 items-center justify-center rounded-lg border border-[#D4D4D4] bg-white cursor-pointer transition-colors shadow-xs"
          style={{ color: "#059669" }}
        >
          <Plus className="size-5" />
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[#A3A3A3]">
          No skills added yet. Start typing above to add your first skill.
        </p>
      )}
    </div>
  );
}
