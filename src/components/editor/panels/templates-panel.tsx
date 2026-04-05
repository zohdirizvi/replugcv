"use client";

import { useState } from "react";
import { cx } from "@/utils/cx";
import { Check } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import type { TemplateStyles } from "../types";

/* ── Mini wireframe preview for each template ── */

function MiniPreviewSingle({ t }: { t: TemplateStyles }) {
  const color = t.accentColor;
  const isCentered = t.headerAlignment === "center";
  const mx = isCentered ? "auto" : "0";

  return (
    <div className="h-full w-full flex flex-col gap-[3px] p-1" style={{ fontFamily: t.bodyFont }}>
      {/* Header */}
      <div className="rounded-sm" style={{ height: 5, width: "60%", backgroundColor: "#1F2937", marginLeft: mx, marginRight: mx }} />
      <div className="rounded-sm" style={{ height: 3, width: "40%", backgroundColor: color, opacity: 0.6, marginLeft: mx, marginRight: mx }} />

      {/* Contact row */}
      <div className="flex gap-1 mt-0.5" style={{ justifyContent: isCentered ? "center" : "flex-start" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-sm bg-gray-200" style={{ height: 2, width: "18%" }} />
        ))}
      </div>

      {/* Section heading */}
      {t.headingStyle === "colored-bg" ? (
        <div className="rounded-sm mt-1" style={{ height: 4, width: "35%", backgroundColor: color }} />
      ) : t.headingStyle === "bordered-left" ? (
        <div className="flex items-center gap-0.5 mt-1">
          <div className="rounded-full" style={{ width: 2, height: 6, backgroundColor: color }} />
          <div className="rounded-sm" style={{ height: 3, width: "30%", backgroundColor: color, opacity: 0.7 }} />
        </div>
      ) : (
        <div className="mt-1 border-b" style={{ borderColor: "#e5e7eb" }}>
          <div className="rounded-sm mb-0.5" style={{ height: 3, width: "30%", backgroundColor: color, opacity: 0.7 }} />
        </div>
      )}

      {/* Content lines */}
      {[100, 85, 70, 90, 60].map((w, i) => (
        <div key={i} className="rounded-sm bg-gray-200" style={{ height: 2, width: `${w}%` }} />
      ))}

      {/* Skills */}
      {t.skillsStyle === "tags" ? (
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          {[20, 25, 18, 22].map((w, i) => (
            <div key={i} className="rounded-sm bg-gray-100 border border-gray-200" style={{ height: 3, width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <div className="flex gap-1 mt-0.5">
          {[30, 25, 35].map((w, i) => (
            <div key={i} className="rounded-sm bg-gray-200" style={{ height: 2, width: `${w}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}

function MiniPreviewTwoColumn({ t }: { t: TemplateStyles }) {
  const color = t.accentColor;
  const sidebarPct = t.sidebarWidth || 35;
  const isLeft = t.sidebarPosition !== "right";
  const sidebarBg = t.sidebarBgColor || "#F8FAFC";
  const hasHeaderBg = !!t.headerBgColor;

  const sidebar = (
    <div
      className="flex flex-col gap-[3px] p-1 shrink-0"
      style={{ width: `${sidebarPct}%`, backgroundColor: sidebarBg, borderRadius: 2 }}
    >
      {[65, 50, 40, 55, 45, 35, 50].map((w, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            height: 2,
            width: `${w}%`,
            backgroundColor: t.sidebarTextColor ? "rgba(255,255,255,0.3)" : "#D4D4D4",
          }}
        />
      ))}
    </div>
  );

  const main = (
    <div className="flex-1 flex flex-col gap-[3px] p-1">
      {[100, 85, 70, 95, 60, 80, 90, 55].map((w, i) => (
        <div key={i} className="rounded-sm bg-gray-200" style={{ height: 2, width: `${w}%` }} />
      ))}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="p-1 pb-0" style={{ backgroundColor: hasHeaderBg ? color : undefined, borderRadius: hasHeaderBg ? "2px 2px 0 0" : undefined }}>
        <div className="rounded-sm" style={{ height: 5, width: "55%", backgroundColor: hasHeaderBg ? "rgba(255,255,255,0.9)" : "#1F2937" }} />
        <div className="rounded-sm mt-[2px] mb-1" style={{ height: 3, width: "35%", backgroundColor: hasHeaderBg ? "rgba(255,255,255,0.5)" : color, opacity: hasHeaderBg ? 1 : 0.6 }} />
      </div>

      {/* Body */}
      <div className="flex-1 flex" style={{ gap: 1 }}>
        {isLeft ? <>{sidebar}{main}</> : <>{main}{sidebar}</>}
      </div>
    </div>
  );
}

/* ── Filter chips ── */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "single", label: "Single Column" },
  { id: "two-column", label: "Two Column" },
  { id: "ats", label: "ATS Optimized" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

// Templates that are ATS-optimized (no colored backgrounds, simple layouts)
const ATS_TEMPLATE_IDS = ["modern-clean", "ivy-league", "minimal", "compact", "professional"];

/* ── Main Panel ── */

export function TemplatesPanel() {
  const { templateId, setTemplateId } = useEditorContext();
  const [filter, setFilter] = useState<FilterId>("all");
  const [viewCols, setViewCols] = useState<1 | 2>(2);

  const filtered = TEMPLATES.filter((t) => {
    if (filter === "all") return true;
    if (filter === "single") return t.layout === "single";
    if (filter === "two-column") return t.layout === "two-column";
    if (filter === "ats") return ATS_TEMPLATE_IDS.includes(t.id);
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="rounded-full px-3 py-1 text-[11px] font-medium border cursor-pointer transition-colors"
            style={{
              backgroundColor: filter === f.id ? "#059669" : "transparent",
              borderColor: filter === f.id ? "#059669" : "#404040",
              color: filter === f.id ? "#FFFFFF" : "#A3A3A3",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#737373]">{filtered.length} template{filtered.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1 rounded-md border border-[#404040] overflow-hidden">
          <button
            onClick={() => setViewCols(2)}
            className="flex size-6 items-center justify-center border-none cursor-pointer transition-colors"
            style={{ backgroundColor: viewCols === 2 ? "#333" : "transparent", color: viewCols === 2 ? "#D4D4D4" : "#737373" }}
            title="Grid view"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" stroke="currentColor"/><rect x="7" y="0.5" width="4.5" height="4.5" rx="1" stroke="currentColor"/><rect x="0.5" y="7" width="4.5" height="4.5" rx="1" stroke="currentColor"/><rect x="7" y="7" width="4.5" height="4.5" rx="1" stroke="currentColor"/></svg>
          </button>
          <button
            onClick={() => setViewCols(1)}
            className="flex size-6 items-center justify-center border-none cursor-pointer transition-colors"
            style={{ backgroundColor: viewCols === 1 ? "#333" : "transparent", color: viewCols === 1 ? "#D4D4D4" : "#737373" }}
            title="List view"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="0.5" y="0.5" width="11" height="3" rx="1" stroke="currentColor"/><rect x="0.5" y="5.5" width="11" height="3" rx="1" stroke="currentColor"/></svg>
          </button>
        </div>
      </div>

      {/* Template grid */}
      <div className={cx(
        "gap-2.5",
        viewCols === 2 ? "grid grid-cols-2" : "flex flex-col"
      )}>
        {filtered.map((t) => {
          const isActive = templateId === t.id;
          const isTwoCol = t.layout === "two-column";

          return (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={cx(
                "group relative flex flex-col rounded-lg border-2 overflow-hidden cursor-pointer bg-transparent p-0 transition-all",
                isActive ? "border-[#059669] shadow-sm" : "border-[#333] hover:border-[#059669]/40"
              )}
            >
              {/* Mini preview */}
              <div className={cx(
                "relative w-full bg-white",
                viewCols === 2 ? "aspect-[3/4]" : "aspect-[5/3]"
              )}>
                {isTwoCol ? <MiniPreviewTwoColumn t={t} /> : <MiniPreviewSingle t={t} />}

                {isActive && (
                  <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-[#059669]">
                    <Check className="size-3 text-white" />
                  </div>
                )}
              </div>

              <div className="border-t border-[#333] px-2.5 py-2 bg-[#1E1E1E] text-left">
                <span
                  className={cx(
                    "text-[11px] font-medium block truncate",
                    isActive ? "text-[#059669]" : "text-[#D4D4D4]"
                  )}
                >
                  {t.name}
                </span>
                <span className="text-[9px] text-[#737373] block truncate mt-0.5">
                  {t.layout === "two-column" ? "Two column" : "Single column"}
                  {ATS_TEMPLATE_IDS.includes(t.id) ? " · ATS optimized" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-[#737373] text-center py-8">No templates match this filter.</p>
      )}
    </div>
  );
}
