"use client";

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

/* ── Main Panel ── */

export function TemplatesPanel() {
  const { templateId, setTemplateId } = useEditorContext();

  const singleCol = TEMPLATES.filter((t) => t.layout === "single");
  const twoCol = TEMPLATES.filter((t) => t.layout === "two-column");

  const renderGrid = (templates: TemplateStyles[]) => (
    <div className="grid grid-cols-2 gap-2">
      {templates.map((t) => {
        const isActive = templateId === t.id;
        const isTwoCol = t.layout === "two-column";

        return (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={cx(
              "group relative flex flex-col rounded-lg border-2 overflow-hidden cursor-pointer bg-transparent p-0 transition-all",
              isActive ? "border-[#8B5CF6] shadow-sm" : "border-[#333] hover:border-[#8B5CF6]/40"
            )}
          >
            {/* Mini preview */}
            <div className="relative aspect-[3/4] w-full bg-white">
              {isTwoCol ? <MiniPreviewTwoColumn t={t} /> : <MiniPreviewSingle t={t} />}

              {isActive && (
                <div className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-[#8B5CF6]">
                  <Check className="size-2.5 text-white" />
                </div>
              )}
            </div>

            <div className="border-t border-[#333] px-2 py-1.5 bg-[#1E1E1E]">
              <span
                className={cx(
                  "text-[10px] font-medium block truncate",
                  isActive ? "text-[#8B5CF6]" : "text-[#A3A3A3]"
                )}
              >
                {t.name}
              </span>
              {t.description && (
                <span className="text-[8px] text-[#737373] block truncate mt-0.5">
                  {t.layout === "two-column" ? "Two column" : "Single column"}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#A3A3A3" }}>
          Single Column
        </h3>
        {renderGrid(singleCol)}
      </div>

      <div className="border-t border-[#333]" />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#A3A3A3" }}>
          Two Column
        </h3>
        {renderGrid(twoCol)}
      </div>
    </div>
  );
}
