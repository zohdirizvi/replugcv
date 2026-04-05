"use client";

import { useEffect } from "react";
import { Plus, Trash01 } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";

export function StepExperience() {
  const { blocks, updateBlockContent, ensureBlock } = useEditorContext();

  const expBlock = blocks.find((b) => b.type === "experience");

  useEffect(() => {
    if (!expBlock) ensureBlock("experience");
  }, [expBlock, ensureBlock]);

  const c = (expBlock?.content as Record<string, unknown>) || {};
  const items = (c.items as Array<Record<string, unknown>>) || [];

  const setItems = (next: Array<Record<string, unknown>>) => {
    if (!expBlock) return;
    updateBlockContent(expBlock.id, { ...c, items: next });
  };

  const updateItem = (idx: number, key: string, value: string) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [key]: value } : item));
    setItems(next);
  };

  const addItem = () => {
    setItems([...items, { company: "", role: "", startDate: "", endDate: "", description: "", bullets: [] }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <h2 className="text-lg font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
        Work experience
      </h2>
      <p className="text-sm text-[#737373] -mt-3">
        Mention all your work experience, starting with the most recent.
      </p>

      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#404040]">
              Entry {idx + 1} of {items.length}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="flex size-7 items-center justify-center rounded-md bg-transparent border-none text-[#737373] cursor-pointer hover:text-red-500 transition-colors"
            >
              <Trash01 className="size-4" />
            </button>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#404040]">
              Company <span style={{ color: "#7F56D9" }}>*</span>
            </label>
            <input
              type="text"
              value={(item.company as string) || ""}
              onChange={(e) => updateItem(idx, "company", e.target.value)}
              placeholder="e.g. Google"
              className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
            />
          </div>

          {/* Job Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#404040]">
              Job title <span style={{ color: "#7F56D9" }}>*</span>
            </label>
            <input
              type="text"
              value={(item.role as string) || ""}
              onChange={(e) => updateItem(idx, "role", e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
            />
          </div>

          {/* Dates side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#404040]">Start date</label>
              <input
                type="text"
                value={(item.startDate as string) || ""}
                onChange={(e) => updateItem(idx, "startDate", e.target.value)}
                placeholder="e.g. Jan 2022"
                className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#404040]">End date</label>
              <input
                type="text"
                value={(item.endDate as string) || ""}
                onChange={(e) => updateItem(idx, "endDate", e.target.value)}
                placeholder="e.g. Present"
                className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#404040]">
              Description <span style={{ color: "#7F56D9" }}>*</span>
            </label>
            <textarea
              value={(item.description as string) || ""}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
              placeholder="Describe your role and responsibilities..."
              className="rounded-lg border border-[#D4D4D4] bg-white px-3.5 py-3 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs resize-y"
              style={{ minHeight: 160 }}
            />
          </div>
        </div>
      ))}

      {/* Add more experience link */}
      <button
        onClick={addItem}
        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors p-0"
        style={{ color: "#16A34A" }}
      >
        <Plus className="size-4" />
        Add more experience
      </button>
    </div>
  );
}
