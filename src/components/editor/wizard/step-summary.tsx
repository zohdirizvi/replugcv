"use client";

import { useEffect } from "react";
import { useEditorContext } from "../editor-context";

export function StepSummary() {
  const { blocks, updateBlockContent, ensureBlock } = useEditorContext();

  const summaryBlock = blocks.find((b) => b.type === "summary");

  useEffect(() => {
    if (!summaryBlock) ensureBlock("summary");
  }, [summaryBlock, ensureBlock]);

  const c = (summaryBlock?.content as Record<string, unknown>) || {};

  const setText = (value: string) => {
    if (!summaryBlock) return;
    updateBlockContent(summaryBlock.id, { ...c, text: value });
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <h2 className="text-lg font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
        Short profile summary
      </h2>
      <p className="text-sm text-[#737373] -mt-3">
        Write a brief professional summary about yourself.
      </p>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          Professional summary <span style={{ color: "#7F56D9" }}>*</span>
        </label>
        <textarea
          value={(c.text as string) || ""}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Experienced software engineer with 5+ years of expertise in full-stack development..."
          className="rounded-lg border border-[#D4D4D4] bg-white px-3.5 py-3 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs resize-y"
          style={{ minHeight: 160 }}
        />
      </div>
    </div>
  );
}
