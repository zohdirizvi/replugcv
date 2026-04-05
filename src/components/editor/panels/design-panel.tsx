"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold01,
  Italic01,
  Underline01,
  File06,
  Download01,
} from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import { usePdfDownload } from "../pdf/use-pdf-download";

const FONT_OPTIONS = [
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia", value: "'Georgia', serif" },
  { label: "Manrope", value: "'Manrope', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Arial", value: "'Arial', sans-serif" },
];

const WEIGHT_OPTIONS = [
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "SemiBold", value: "600" },
  { label: "Bold", value: "700" },
];

export function DesignPanel() {
  const { templateId } = useEditorContext();
  const style = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const { downloadPdf, isGenerating } = usePdfDownload();

  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [weightDropdownOpen, setWeightDropdownOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(style.bodyFont);
  const [selectedWeight, setSelectedWeight] = useState("600");
  const [selectedSize, setSelectedSize] = useState("12");
  const [lineHeight, setLineHeight] = useState("150");
  const [letterSpacing, setLetterSpacing] = useState("0");
  const [selectedColor, setSelectedColor] = useState("#171717");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState("100");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "top" | "middle" | "bottom">("left");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  // suppress unused warnings
  void bgColor;
  void setBgColor;

  const alignButtons = [
    { value: "left" as const, Icon: AlignLeft, label: "Align left" },
    { value: "center" as const, Icon: AlignCenter, label: "Align center" },
    { value: "right" as const, Icon: AlignRight, label: "Align right" },
    { value: "top" as const, Icon: ChevronUp, label: "Align top" },
    { value: "middle" as const, Icon: AlignCenter, label: "Align middle" },
    { value: "bottom" as const, Icon: ChevronDown, label: "Align bottom" },
  ];

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-l border-secondary bg-primary">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Align section */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-primary mb-2.5 block">Align</span>
          <div className="flex gap-1">
            {alignButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setAlignment(btn.value)}
                className={cx(
                  "flex size-8 items-center justify-center rounded-md border-none cursor-pointer transition-colors",
                  alignment === btn.value
                    ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                    : "bg-transparent text-fg-quaternary hover:bg-secondary hover:text-primary"
                )}
                title={btn.label}
              >
                <btn.Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Text section */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-primary mb-2.5 block">Text</span>

          {/* Font family dropdown */}
          <div className="mb-2 relative">
            <button
              onClick={() => setFontDropdownOpen((v) => !v)}
              className="flex w-full items-center justify-between h-8 rounded-md border border-secondary bg-primary px-2.5 text-xs text-primary cursor-pointer"
            >
              <span style={{ fontFamily: selectedFont }}>
                {FONT_OPTIONS.find((f) => f.value === selectedFont)?.label || "Inter"}
              </span>
              <ChevronDown className="size-3 text-fg-quaternary" />
            </button>
            {fontDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-lg border border-secondary bg-primary shadow-lg py-1 max-h-48 overflow-y-auto">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setSelectedFont(f.value);
                      setFontDropdownOpen(false);
                    }}
                    className={cx(
                      "w-full px-3 py-1.5 text-left text-xs bg-transparent border-none cursor-pointer transition-colors",
                      selectedFont === f.value
                        ? "text-[#8B5CF6] font-semibold"
                        : "text-tertiary hover:bg-secondary"
                    )}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weight + Size row */}
          <div className="mb-2 flex gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setWeightDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between h-8 rounded-md border border-secondary bg-primary px-2.5 text-xs text-primary cursor-pointer"
              >
                <span>{WEIGHT_OPTIONS.find((w) => w.value === selectedWeight)?.label || "SemiBold"}</span>
                <ChevronDown className="size-3 text-fg-quaternary" />
              </button>
              {weightDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-lg border border-secondary bg-primary shadow-lg py-1">
                  {WEIGHT_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => {
                        setSelectedWeight(w.value);
                        setWeightDropdownOpen(false);
                      }}
                      className={cx(
                        "w-full px-3 py-1.5 text-left text-xs bg-transparent border-none cursor-pointer transition-colors",
                        selectedWeight === w.value
                          ? "text-[#8B5CF6] font-semibold"
                          : "text-tertiary hover:bg-secondary"
                      )}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-12 h-8 rounded-md border border-secondary bg-primary px-2 text-xs text-primary text-center outline-none"
            />
          </div>

          {/* Line height + Letter spacing row */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1">
              <span className="text-[10px] text-fg-quaternary">LH</span>
              <input
                type="text"
                value={lineHeight}
                onChange={(e) => setLineHeight(e.target.value)}
                className="w-10 h-8 rounded-md border border-secondary bg-primary px-1.5 text-xs text-primary text-center outline-none"
              />
            </div>
            <div className="flex items-center gap-1 flex-1">
              <span className="text-[10px] text-fg-quaternary">W</span>
              <input
                type="text"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(e.target.value)}
                className="w-10 h-8 rounded-md border border-secondary bg-primary px-1.5 text-xs text-primary text-center outline-none"
              />
              <span className="text-[10px] text-fg-quaternary">px</span>
            </div>
          </div>

          {/* Formatting row */}
          <div className="flex gap-1">
            <button
              onClick={() => setBold(!bold)}
              className={cx(
                "flex size-8 items-center justify-center rounded-md border-none cursor-pointer text-sm font-bold transition-colors",
                bold
                  ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                  : "bg-transparent text-fg-quaternary hover:bg-secondary"
              )}
            >
              <Bold01 className="size-4" />
            </button>
            <button
              onClick={() => setItalic(!italic)}
              className={cx(
                "flex size-8 items-center justify-center rounded-md border-none cursor-pointer transition-colors",
                italic
                  ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                  : "bg-transparent text-fg-quaternary hover:bg-secondary"
              )}
            >
              <Italic01 className="size-4" />
            </button>
            <button
              onClick={() => setUnderline(!underline)}
              className={cx(
                "flex size-8 items-center justify-center rounded-md border-none cursor-pointer transition-colors",
                underline
                  ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                  : "bg-transparent text-fg-quaternary hover:bg-secondary"
              )}
            >
              <Underline01 className="size-4" />
            </button>
            <div className="w-px bg-secondary mx-0.5" />
            <button className="flex size-8 items-center justify-center rounded-md border-none cursor-pointer bg-transparent text-fg-quaternary hover:bg-secondary text-[10px] font-semibold">
              Ag
            </button>
            <button className="flex size-8 items-center justify-center rounded-md border-none cursor-pointer bg-transparent text-fg-quaternary hover:bg-secondary text-[10px] font-semibold lowercase">
              ag
            </button>
            <button className="flex size-8 items-center justify-center rounded-md border-none cursor-pointer bg-transparent text-fg-quaternary hover:bg-secondary text-[10px] font-semibold uppercase">
              AG
            </button>
          </div>
        </div>

        {/* Color section */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-primary mb-2.5 block">Color</span>
          <div className="flex items-center gap-2">
            {/* Color swatch */}
            <div
              className="size-7 rounded-full border border-secondary shrink-0 cursor-pointer"
              style={{ backgroundColor: selectedColor }}
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-20 h-8 rounded-md border border-secondary bg-primary px-2 text-xs text-primary outline-none font-mono"
            />
            {/* Background swatch */}
            <div
              className="size-7 rounded-full border border-secondary shrink-0 cursor-pointer"
              style={{ backgroundColor: "#FFFFFF" }}
            />
            {/* Opacity */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={opacity}
                onChange={(e) => setOpacity(e.target.value)}
                className="w-10 h-8 rounded-md border border-secondary bg-primary px-1.5 text-xs text-primary text-center outline-none"
              />
              <span className="text-[10px] text-fg-quaternary">%</span>
            </div>
          </div>
        </div>

        {/* Export section */}
        <div>
          <span className="text-xs font-semibold text-primary mb-2.5 block">Export</span>
          <div className="flex flex-col gap-2">
            {/* PDF */}
            <button
              onClick={downloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-3 rounded-lg border border-secondary bg-primary px-3 py-2.5 cursor-pointer hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-red-50">
                <File06 className="size-4 text-red-500" />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-xs font-semibold text-primary">PDF</span>
                <span className="text-[10px] text-quaternary">{isGenerating ? "Generating..." : "Download PDF"}</span>
              </div>
              <Download01 className="size-4 text-fg-quaternary" />
            </button>
            {/* DOC */}
            <button className="flex items-center gap-3 rounded-lg border border-secondary bg-primary px-3 py-2.5 cursor-pointer hover:bg-secondary transition-colors">
              <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
                <File06 className="size-4 text-blue-500" />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-xs font-semibold text-primary">DOC</span>
                <span className="text-[10px] text-quaternary">756 Kb</span>
              </div>
              <Download01 className="size-4 text-fg-quaternary" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
