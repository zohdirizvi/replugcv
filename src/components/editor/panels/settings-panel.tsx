"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lock01, Check } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";
import { BLOCK_META } from "../constants";

/* ---------- Constants ---------- */

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter", type: "sans" },
  { label: "Roboto", value: "Roboto", type: "sans" },
  { label: "Open Sans", value: "Open Sans", type: "sans" },
  { label: "Lato", value: "Lato", type: "sans" },
  { label: "Montserrat", value: "Montserrat", type: "sans" },
  { label: "Poppins", value: "Poppins", type: "sans" },
  { label: "Raleway", value: "Raleway", type: "sans" },
  { label: "Source Sans Pro", value: "Source Sans 3", type: "sans" },
  { label: "Nunito", value: "Nunito", type: "sans" },
  { label: "Work Sans", value: "Work Sans", type: "sans" },
  { label: "Playfair Display", value: "Playfair Display", type: "serif" },
  { label: "Merriweather", value: "Merriweather", type: "serif" },
  { label: "Lora", value: "Lora", type: "serif" },
  { label: "Georgia", value: "Georgia", type: "serif-system" },
];

const COLOR_PRESETS = [
  { label: "Classic Black", value: "#111827", hint: "safest for ATS" },
  { label: "Navy Blue", value: "#1E3A5F", hint: "professional, ATS-safe" },
  { label: "Dark Teal", value: "#0D5E4F", hint: "modern, accessible" },
  { label: "Charcoal", value: "#374151", hint: "soft professional" },
  { label: "Dark Purple", value: "#4C1D95", hint: "creative but readable" },
  { label: "Forest Green", value: "#14532D", hint: "unique, high contrast" },
  { label: "Dark Red", value: "#7F1D1D", hint: "bold accent" },
  { label: "Slate", value: "#334155", hint: "neutral modern" },
];

/* ---------- Helpers ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#A3A3A3" }}>
      {children}
    </h3>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  leftLabel,
  rightLabel,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  leftLabel?: string;
  rightLabel?: string;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#D4D4D4]">{label}</span>
        <span className="text-xs font-medium text-[#A3A3A3]">
          {value}{unit || ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #059669 ${((value - min) / (max - min)) * 100}%, #404040 ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-[#737373]">{leftLabel}</span>
          <span className="text-[10px] text-[#737373]">{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Font loader ---------- */
function useGoogleFont(fontFamily: string) {
  const loadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (fontFamily === "Georgia") return; // system font
    if (loadedRef.current.has(fontFamily)) return;
    loadedRef.current.add(fontFamily);

    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, [fontFamily]);
}

/* ---------- Main Panel ---------- */

export function SettingsPanel() {
  const {
    designSettings,
    updateDesignSettings,
    blocks,
    reorderBlocks,
    toggleBlockVisibility,
  } = useEditorContext();

  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColorDraft, setCustomColorDraft] = useState(designSettings.accentColor);

  // Load the currently selected Google Font
  useGoogleFont(designSettings.fontFamily);

  // Drag state for section reorder
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleSectionDragEnd = useCallback(() => {
    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
      reorderBlocks(dragFrom, dragOver);
    }
    setDragFrom(null);
    setDragOver(null);
  }, [dragFrom, dragOver, reorderBlocks]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">
      {/* ---- Page Margins ---- */}
      <section>
        <SectionLabel>Page Margins</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {(["top", "bottom", "left", "right"] as const).map((side) => (
            <div key={side}>
              <label className="text-[10px] text-[#A3A3A3] uppercase tracking-wide mb-1 block">
                {side}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={designSettings.margins[side]}
                  onChange={(e) => {
                    const val = Math.max(10, Math.min(60, Number(e.target.value)));
                    updateDesignSettings({
                      margins: { ...designSettings.margins, [side]: val },
                    });
                  }}
                  onFocus={() => window.dispatchEvent(new CustomEvent("replugcv:activeMargin", { detail: side }))}
                  onBlur={() => window.dispatchEvent(new CustomEvent("replugcv:activeMargin", { detail: null }))}
                  className="w-full h-8 rounded-md border border-[#404040] bg-[#2A2727] px-2 text-xs text-white outline-none focus:border-[#059669]"
                />
                <span className="text-[10px] text-[#737373] shrink-0">px</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#333]" />

      {/* ---- Section Spacing ---- */}
      <section>
        <SectionLabel>Section Spacing</SectionLabel>
        <SliderRow
          label="Gap between sections"
          value={designSettings.sectionSpacing}
          min={12}
          max={24}
          step={2}
          leftLabel="compact"
          rightLabel="more space"
          unit="px"
          onChange={(v) => updateDesignSettings({ sectionSpacing: v })}
        />
      </section>

      <div className="border-t border-[#333]" />

      {/* ---- Font Style ---- */}
      <section>
        <SectionLabel>Font Style</SectionLabel>
        <select
          value={designSettings.fontFamily}
          onChange={(e) => updateDesignSettings({ fontFamily: e.target.value })}
          className="w-full h-9 rounded-md border border-[#404040] bg-[#2A2727] px-2 text-sm text-white outline-none focus:border-[#059669] cursor-pointer"
        >
          <optgroup label="Sans-serif">
            {FONT_OPTIONS.filter((f) => f.type === "sans").map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Serif">
            {FONT_OPTIONS.filter((f) => f.type.startsWith("serif")).map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </optgroup>
        </select>
        <p className="text-[10px] text-[#737373] mt-1.5">
          Preview: <span style={{ fontFamily: `'${designSettings.fontFamily}', sans-serif` }}>The quick brown fox jumps over the lazy dog</span>
        </p>
      </section>

      <div className="border-t border-[#333]" />

      {/* ---- Font Size ---- */}
      <section>
        <SectionLabel>Font Size</SectionLabel>
        <SliderRow
          label="Base size"
          value={designSettings.baseFontSize}
          min={10}
          max={14}
          step={1}
          leftLabel="small"
          rightLabel="large"
          unit="px"
          onChange={(v) => updateDesignSettings({ baseFontSize: v })}
        />
      </section>

      <div className="border-t border-[#333]" />

      {/* ---- Line Height ---- */}
      <section>
        <SectionLabel>Line Height</SectionLabel>
        <SliderRow
          label="Spacing"
          value={designSettings.lineHeight}
          min={1.2}
          max={1.8}
          step={0.1}
          leftLabel="condensed"
          rightLabel="spacious"
          onChange={(v) => updateDesignSettings({ lineHeight: Math.round(v * 10) / 10 })}
        />
      </section>

      <div className="border-t border-[#333]" />

      {/* ---- Colors ---- */}
      <section>
        <SectionLabel>Theme Color</SectionLabel>
        <p className="text-[10px] text-[#737373] mb-2">Applied to section headings and accents in your resume. All presets are ATS-safe.</p>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_PRESETS.map((c) => {
            const isActive = designSettings.accentColor === c.value;
            return (
              <button
                key={c.value}
                onClick={() => {
                  updateDesignSettings({ accentColor: c.value });
                  setShowCustomColor(false);
                }}
                className="relative size-8 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center"
                style={{
                  backgroundColor: c.value,
                  borderColor: isActive ? "#059669" : "transparent",
                }}
                title={`${c.label} - ${c.hint}`}
              >
                {isActive && <Check className="size-3.5 text-white" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowCustomColor(!showCustomColor)}
          className="mt-2 text-[11px] font-medium bg-transparent border-none cursor-pointer p-0"
          style={{ color: "#059669" }}
        >
          {showCustomColor ? "Hide custom color" : "Use custom color"}
        </button>
        {showCustomColor && (
          <div className="mt-2 flex items-center gap-2">
            <div
              className="size-8 rounded-full border border-[#404040] shrink-0"
              style={{ backgroundColor: customColorDraft }}
            />
            <input
              value={customColorDraft}
              onChange={(e) => setCustomColorDraft(e.target.value)}
              onBlur={() => {
                if (/^#[0-9A-Fa-f]{6}$/.test(customColorDraft)) {
                  updateDesignSettings({ accentColor: customColorDraft });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && /^#[0-9A-Fa-f]{6}$/.test(customColorDraft)) {
                  updateDesignSettings({ accentColor: customColorDraft });
                }
              }}
              placeholder="#111827"
              className="h-8 flex-1 rounded-md border border-[#404040] bg-[#2A2727] px-2 text-xs text-white outline-none focus:border-[#059669] font-mono"
            />
          </div>
        )}
      </section>

      <div className="border-t border-[#333]" />

      {/* ---- Section Visibility & Reorder ---- */}
      <section>
        <SectionLabel>Sections</SectionLabel>
        <p className="text-[10px] text-[#737373] mb-3">Drag to reorder, toggle to show/hide</p>
        <div className="space-y-1">
          {blocks.map((block, idx) => {
            const meta = BLOCK_META[block.type];
            const Icon = meta?.icon;
            const isHeader = block.type === "header";
            const isVisible = block.is_visible !== false;

            return (
              <div
                key={block.id}
                draggable={!isHeader}
                onDragStart={() => !isHeader && setDragFrom(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isHeader) setDragOver(idx);
                }}
                onDragEnd={handleSectionDragEnd}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
                style={{
                  backgroundColor: dragOver === idx ? "#333" : "transparent",
                  opacity: !isVisible ? 0.5 : 1,
                }}
              >
                {/* Drag handle */}
                <span
                  className="text-[#737373] text-xs shrink-0 select-none"
                  style={{ cursor: isHeader ? "default" : "grab", width: 12 }}
                >
                  {isHeader ? "" : "\u2807"}
                </span>

                {/* Icon + name */}
                {Icon && <Icon className="size-3.5 text-[#A3A3A3] shrink-0" />}
                <span className="text-xs text-[#D4D4D4] flex-1 truncate">
                  {block.title}
                </span>

                {/* Toggle or lock */}
                {isHeader ? (
                  <Lock01 className="size-3.5 text-[#737373] shrink-0" />
                ) : (
                  <button
                    onClick={() => toggleBlockVisibility(block.id)}
                    className="relative w-8 h-4.5 rounded-full border-none cursor-pointer transition-colors shrink-0"
                    style={{
                      backgroundColor: isVisible ? "#059669" : "#404040",
                    }}
                    title={isVisible ? "Hide section" : "Show section"}
                  >
                    <span
                      className="absolute top-0.5 size-3.5 rounded-full bg-white transition-all"
                      style={{
                        left: isVisible ? 16 : 2,
                      }}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
}
