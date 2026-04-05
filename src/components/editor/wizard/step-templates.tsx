"use client";

import { Check } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import type { TemplateStyles } from "../types";

/* ── Mini wireframe previews ── */

function MiniSingle({ t }: { t: TemplateStyles }) {
  const color = t.accentColor;
  const centered = t.headerAlignment === "center";
  const mx = centered ? "auto" : "0";

  return (
    <div className="h-full w-full flex flex-col gap-[3px] p-2">
      <div className="rounded-sm" style={{ height: 6, width: "60%", backgroundColor: "#1F2937", marginLeft: mx, marginRight: mx }} />
      <div className="rounded-sm" style={{ height: 4, width: "40%", backgroundColor: color, opacity: 0.6, marginLeft: mx, marginRight: mx }} />
      <div className="flex gap-1 mt-1" style={{ justifyContent: centered ? "center" : "flex-start" }}>
        {[1, 2, 3].map((i) => <div key={i} className="rounded-sm bg-gray-200" style={{ height: 3, width: "18%" }} />)}
      </div>
      {t.headingStyle === "colored-bg" ? (
        <div className="rounded-sm mt-1.5" style={{ height: 5, width: "35%", backgroundColor: color }} />
      ) : t.headingStyle === "bordered-left" ? (
        <div className="flex items-center gap-1 mt-1.5">
          <div className="rounded-full" style={{ width: 2, height: 8, backgroundColor: color }} />
          <div className="rounded-sm" style={{ height: 4, width: "30%", backgroundColor: color, opacity: 0.7 }} />
        </div>
      ) : (
        <div className="mt-1.5 border-b" style={{ borderColor: "#e5e7eb" }}>
          <div className="rounded-sm mb-1" style={{ height: 4, width: "30%", backgroundColor: color, opacity: 0.7 }} />
        </div>
      )}
      {[100, 85, 70, 90, 60].map((w, i) => (
        <div key={i} className="rounded-sm bg-gray-200" style={{ height: 3, width: `${w}%` }} />
      ))}
    </div>
  );
}

function MiniTwoColumn({ t }: { t: TemplateStyles }) {
  const color = t.accentColor;
  const sidebarPct = t.sidebarWidth || 35;
  const isLeft = t.sidebarPosition !== "right";
  const sidebarBg = t.sidebarBgColor || "#F8FAFC";
  const hasHeaderBg = !!t.headerBgColor;

  const sidebar = (
    <div className="flex flex-col gap-[3px] p-1.5 shrink-0" style={{ width: `${sidebarPct}%`, backgroundColor: sidebarBg, borderRadius: 3 }}>
      {[65, 50, 40, 55, 45, 35, 50].map((w, i) => (
        <div key={i} className="rounded-sm" style={{ height: 3, width: `${w}%`, backgroundColor: t.sidebarTextColor ? "rgba(255,255,255,0.3)" : "#D4D4D4" }} />
      ))}
    </div>
  );
  const main = (
    <div className="flex-1 flex flex-col gap-[3px] p-1.5">
      {[100, 85, 70, 95, 60, 80, 90, 55].map((w, i) => (
        <div key={i} className="rounded-sm bg-gray-200" style={{ height: 3, width: `${w}%` }} />
      ))}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-2 pb-0" style={{ backgroundColor: hasHeaderBg ? color : undefined, borderRadius: hasHeaderBg ? "4px 4px 0 0" : undefined }}>
        <div className="rounded-sm" style={{ height: 6, width: "55%", backgroundColor: hasHeaderBg ? "rgba(255,255,255,0.9)" : "#1F2937" }} />
        <div className="rounded-sm mt-[3px] mb-1.5" style={{ height: 4, width: "35%", backgroundColor: hasHeaderBg ? "rgba(255,255,255,0.5)" : color, opacity: hasHeaderBg ? 1 : 0.6 }} />
      </div>
      <div className="flex-1 flex" style={{ gap: 1 }}>
        {isLeft ? <>{sidebar}{main}</> : <>{main}{sidebar}</>}
      </div>
    </div>
  );
}

/* ── Main Step ── */

export function StepTemplates() {
  const { templateId, setTemplateId } = useEditorContext();

  const singleCol = TEMPLATES.filter((t) => t.layout === "single");
  const twoCol = TEMPLATES.filter((t) => t.layout === "two-column");

  const renderGrid = (templates: TemplateStyles[], label: string) => (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-3">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((t) => {
          const isActive = templateId === t.id;
          const isTwoCol = t.layout === "two-column";
          return (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className="group relative flex flex-col rounded-xl border-2 overflow-hidden cursor-pointer bg-transparent p-0 transition-all"
              style={{
                borderColor: isActive ? "#059669" : "#E5E5E5",
                boxShadow: isActive ? "0 0 0 1px #059669" : undefined,
              }}
            >
              <div className="relative aspect-[3/4] w-full bg-white">
                {isTwoCol ? <MiniTwoColumn t={t} /> : <MiniSingle t={t} />}
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full" style={{ backgroundColor: "#059669" }}>
                    <Check className="size-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="border-t border-[#E5E5E5] px-3 py-2.5 text-left">
                <span className="text-sm font-medium block" style={{ color: isActive ? "#059669" : "#404040" }}>
                  {t.name}
                </span>
                <span className="text-[11px] text-[#A3A3A3] block mt-0.5 leading-tight">
                  {t.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Resume templates
        </h2>
        <p className="text-sm text-[#737373] mt-1">
          Pick the best template for your resume. You can always change it later from the Templates tab.
        </p>
      </div>

      {renderGrid(singleCol, "Single Column")}
      {renderGrid(twoCol, "Two Column")}
    </div>
  );
}
