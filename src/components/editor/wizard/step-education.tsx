"use client";

import { useEffect } from "react";
import { Plus, Trash01 } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";

export function StepEducation() {
  const { blocks, updateBlockContent, ensureBlock } = useEditorContext();

  const eduBlock = blocks.find((b) => b.type === "education");

  useEffect(() => {
    if (!eduBlock) ensureBlock("education");
  }, [eduBlock, ensureBlock]);

  const c = (eduBlock?.content as Record<string, unknown>) || {};
  const items = (c.items as Array<Record<string, unknown>>) || [];

  const setItems = (next: Array<Record<string, unknown>>) => {
    if (!eduBlock) return;
    updateBlockContent(eduBlock.id, { ...c, items: next });
  };

  const updateItem = (idx: number, key: string, value: string) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [key]: value } : item));
    setItems(next);
  };

  const addItem = () => {
    setItems([...items, { school: "", degree: "", field: "", startYear: "", endYear: "", gpa: "" }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <h2 className="text-lg font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
        Education
      </h2>
      <p className="text-sm text-[#737373] -mt-3">
        Mention all your academic details and qualifications.
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

          {/* School */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#404040]">
              School <span style={{ color: "#7F56D9" }}>*</span>
            </label>
            <input
              type="text"
              value={(item.school as string) || ""}
              onChange={(e) => updateItem(idx, "school", e.target.value)}
              placeholder="e.g. Stanford University"
              className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
            />
          </div>

          {/* Degree */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#404040]">
              Degree <span style={{ color: "#7F56D9" }}>*</span>
            </label>
            <input
              type="text"
              value={(item.degree as string) || ""}
              onChange={(e) => updateItem(idx, "degree", e.target.value)}
              placeholder="e.g. Bachelor of Science"
              className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
            />
          </div>

          {/* Field of Study */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#404040]">
              Field of study
            </label>
            <input
              type="text"
              value={(item.field as string) || ""}
              onChange={(e) => updateItem(idx, "field", e.target.value)}
              placeholder="e.g. Computer Science"
              className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
            />
          </div>

          {/* Years side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#404040]">Start year</label>
              <input
                type="text"
                value={(item.startYear as string) || ""}
                onChange={(e) => updateItem(idx, "startYear", e.target.value)}
                placeholder="e.g. 2018"
                className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#404040]">End year</label>
              <input
                type="text"
                value={(item.endYear as string) || ""}
                onChange={(e) => updateItem(idx, "endYear", e.target.value)}
                placeholder="e.g. 2022"
                className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
              />
            </div>
          </div>

          {/* GPA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#404040]">
              GPA (optional)
            </label>
            <input
              type="text"
              value={(item.gpa as string) || ""}
              onChange={(e) => updateItem(idx, "gpa", e.target.value)}
              placeholder="e.g. 3.8"
              className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors p-0"
        style={{ color: "#16A34A" }}
      >
        <Plus className="size-4" />
        Add more education
      </button>
    </div>
  );
}
