"use client";

import { use, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { EditorProvider, useEditorContext } from "@/components/editor/editor-context";
import { EditorTopBar } from "@/components/editor/editor-top-bar";
import { LeftPanel } from "@/components/editor/panels/left-panel";
import { ResumePreview } from "@/components/editor/preview/resume-preview";
import { StepForm } from "@/components/editor/wizard/step-form";
import { TEMPLATES } from "@/components/editor/constants";

/* ------------------------------------------------------------------ */
/*  Inner layout — consumes context                                    */
/* ------------------------------------------------------------------ */

function EditorInner() {
  const router = useRouter();
  const { loading, resume, currentStep, goNextStep, goPrevStep, templateId, zoom, setZoom, designSettings, updateDesignSettings } = useEditorContext();

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  /* --- Multi-page reflow --- */
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const A4_HEIGHT = 842;
  const usableHeight = A4_HEIGHT - designSettings.margins.top - designSettings.margins.bottom;

  const measurePages = useCallback(() => {
    if (!contentRef.current) return;
    // Use getBoundingClientRect on the content div for accurate height measurement
    const contentRect = contentRef.current.getBoundingClientRect();
    // Account for the zoom transform — divide by zoom to get unscaled height
    const contentHeight = contentRect.height / zoom;
    // Content must exceed page height by at least 40px to warrant a second page
    const buffer = 40;
    const effectiveHeight = Math.max(0, contentHeight - buffer);
    setPageCount(Math.max(1, Math.ceil(effectiveHeight / usableHeight)));
  }, [usableHeight, zoom]);

  useEffect(() => {
    measurePages();
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measurePages);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measurePages]);

  /* --- Resizable split panels --- */
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(45); // 45% form, 55% preview
  const [isDragging, setIsDragging] = useState(false);

  /* --- Active margin highlight from settings panel or drag --- */
  const [activeMargin, setActiveMargin] = useState<string | null>(null);
  const [draggingMargin, setDraggingMargin] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | null;
      setActiveMargin(detail);
    };
    window.addEventListener("replugcv:activeMargin", handler);
    return () => window.removeEventListener("replugcv:activeMargin", handler);
  }, []);

  /* --- Draggable margin handles --- */
  const handleMarginDragStart = useCallback(
    (edge: "top" | "bottom" | "left" | "right", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingMargin(edge);
      setActiveMargin(edge);

      const startY = e.clientY;
      const startX = e.clientX;
      const startValue = designSettings.margins[edge];

      const onMove = (ev: MouseEvent) => {
        let delta: number;
        if (edge === "top") delta = (ev.clientY - startY) / zoom;
        else if (edge === "bottom") delta = -(ev.clientY - startY) / zoom;
        else if (edge === "left") delta = (ev.clientX - startX) / zoom;
        else delta = -(ev.clientX - startX) / zoom;

        const newValue = Math.round(Math.max(10, Math.min(60, startValue + delta)));
        updateDesignSettings({ margins: { ...designSettings.margins, [edge]: newValue } });
      };

      const onUp = () => {
        setDraggingMargin(null);
        setActiveMargin(null);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [designSettings.margins, zoom, updateDesignSettings]
  );

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(30, Math.min(70, pct))); // clamp 30-70%
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  /* --- Dynamic Google Font loading --- */
  useEffect(() => {
    // Load both the user-selected font and the template's heading font
    const families = new Set<string>();
    families.add(designSettings.fontFamily);
    // Extract font family name from template font string like "'Playfair Display', serif"
    const headingMatch = template.headingFont.match(/^'([^']+)'/);
    if (headingMatch) families.add(headingMatch[1]);
    const bodyMatch = template.bodyFont.match(/^'([^']+)'/);
    if (bodyMatch) families.add(bodyMatch[1]);

    families.forEach((family) => {
      if (family === "Georgia") return;
      const id = `gfont-${family.replace(/\s/g, "-")}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    });
  }, [designSettings.fontFamily, template.headingFont, template.bodyFont]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ backgroundColor: "#FAFAFA" }}>
        <svg className="size-8 animate-spin" viewBox="0 0 20 20" fill="none">
          <circle className="opacity-30" cx="10" cy="10" r="8" strokeWidth="2" stroke="#059669" />
          <circle
            className="origin-center animate-spin"
            cx="10"
            cy="10"
            r="8"
            strokeWidth="2"
            stroke="#059669"
            strokeDasharray="12.5 50"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ color: "#737373" }}>
        <p className="text-sm">Resume not found.</p>
        <Button color="secondary" size="sm" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  /* --- Margin overlay helper --- */
  const marginOverlays = activeMargin ? (
    <>
      {activeMargin === "top" && (
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: designSettings.margins.top, backgroundColor: "rgba(22, 163, 74, 0.12)" }}
        />
      )}
      {activeMargin === "bottom" && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: designSettings.margins.bottom, backgroundColor: "rgba(22, 163, 74, 0.12)" }}
        />
      )}
      {activeMargin === "left" && (
        <div
          className="absolute top-0 bottom-0 left-0 pointer-events-none z-10"
          style={{ width: designSettings.margins.left, backgroundColor: "rgba(22, 163, 74, 0.12)" }}
        />
      )}
      {activeMargin === "right" && (
        <div
          className="absolute top-0 bottom-0 right-0 pointer-events-none z-10"
          style={{ width: designSettings.margins.right, backgroundColor: "rgba(22, 163, 74, 0.12)" }}
        />
      )}
    </>
  ) : null;

  return (
    <div className="fixed inset-0 flex">
      {/* Left: Dark sidebar 304px */}
      <LeftPanel />

      {/* Right: Everything else */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar 80px */}
        <EditorTopBar />

        {/* Content: Form + Drag handle + Preview, resizable */}
        <div className="flex-1 flex min-h-0" ref={splitContainerRef}>
          {/* Form area */}
          <div
            className="flex flex-col bg-white min-w-0 overflow-hidden"
            style={{ width: `${splitPercent}%` }}
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
              <StepForm />
            </div>

            {/* Bottom nav bar — translucent dock */}
            <div
              className="px-6 py-3 flex items-center justify-between shrink-0 relative"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderTop: "1px solid rgba(5, 150, 105, 0.15)",
                boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.04)",
              }}
            >
              {currentStep > 1 ? (
                <button
                  onClick={goPrevStep}
                  className="flex items-center gap-2 rounded-lg border border-[#D4D4D4] bg-white px-4 py-2 text-sm font-medium cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                  style={{ color: "#404040" }}
                >
                  <ChevronLeft className="size-4" />
                  Back to previous step
                </button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <button
                  onClick={goNextStep}
                  className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#16A34A" }}
                >
                  Continue
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  onClick={goNextStep}
                  className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#059669" }}
                >
                  Finish
                </button>
              )}
            </div>
          </div>

          {/* Drag handle to resize */}
          <div
            className="w-[6px] shrink-0 cursor-col-resize flex items-center justify-center hover:bg-[#059669]/20 transition-colors group relative"
            style={{ backgroundColor: isDragging ? "rgba(5,150,105,0.15)" : "#E5E5E5" }}
            onMouseDown={handleDragStart}
          >
            <div className="w-[2px] h-8 rounded-full bg-[#A3A3A3] group-hover:bg-[#059669] transition-colors" />
          </div>

          {/* Preview area */}
          <div
            className="flex flex-col min-w-0 overflow-hidden"
            style={{ width: `${100 - splitPercent}%`, backgroundColor: "#F1F5F9" }}
          >
            {/* Zoom controls bar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-[#E2E8F0]">
              <span className="text-xs text-gray-500">Live Preview</span>
              <div className="flex items-center gap-2">
                {[50, 75, 100, 125, 150].map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoom(z / 100)}
                    className={`px-2 py-0.5 rounded text-xs font-medium border-none cursor-pointer transition-colors ${
                      Math.round(zoom * 100) === z
                        ? "bg-[#059669] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {z}%
                  </button>
                ))}
                <span className="text-xs text-gray-400 ml-1">Page {pageCount > 0 ? 1 : 0} of {pageCount}</span>
              </div>
            </div>

            {/* Scrollable preview — single content render, no duplication */}
            <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto scrollbar-thin">
              <div
                className="relative"
                style={{ width: 595 * zoom }}
              >
                <div
                  style={{
                    width: 595,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  {/* Single A4 page with content — grows naturally */}
                  <div
                    className="bg-white rounded-lg shadow-lg relative"
                    style={{
                      width: 595,
                      minHeight: A4_HEIGHT,
                      fontFamily: `'${designSettings.fontFamily}', ${template.bodyFont}`,
                      fontSize: designSettings.baseFontSize + "px",
                      lineHeight: designSettings.lineHeight,
                      color: "#111827",
                    }}
                  >
                    {/* Margin overlays */}
                    {marginOverlays}

                    {/* Draggable margin handles */}
                    <div
                      className="absolute top-0 left-0 right-0 z-20 cursor-ns-resize group/mh"
                      style={{ height: designSettings.margins.top }}
                      onMouseDown={(e) => handleMarginDragStart("top", e)}
                    >
                      <div className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-transparent group-hover/mh:bg-[#059669]/40 transition-colors" />
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 z-20 cursor-ns-resize group/mh"
                      style={{ height: designSettings.margins.bottom }}
                      onMouseDown={(e) => handleMarginDragStart("bottom", e)}
                    >
                      <div className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-transparent group-hover/mh:bg-[#059669]/40 transition-colors" />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 left-0 z-20 cursor-ew-resize group/mh"
                      style={{ width: designSettings.margins.left }}
                      onMouseDown={(e) => handleMarginDragStart("left", e)}
                    >
                      <div className="absolute right-0 top-[20%] bottom-[20%] w-[2px] bg-transparent group-hover/mh:bg-[#059669]/40 transition-colors" />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 right-0 z-20 cursor-ew-resize group/mh"
                      style={{ width: designSettings.margins.right }}
                      onMouseDown={(e) => handleMarginDragStart("right", e)}
                    >
                      <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-transparent group-hover/mh:bg-[#059669]/40 transition-colors" />
                    </div>

                    {/* Content — rendered ONCE, grows naturally */}
                    <div
                      ref={contentRef}
                      style={{
                        paddingTop: designSettings.margins.top,
                        paddingBottom: designSettings.margins.bottom,
                        paddingLeft: designSettings.margins.left,
                        paddingRight: designSettings.margins.right,
                      }}
                    >
                      <ResumePreview />
                    </div>

                    {/* Page break indicator lines */}
                    {pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                        style={{ top: A4_HEIGHT * (i + 1) }}
                      >
                        <div className="flex-1 border-t-2 border-dashed border-red-300/50" />
                        <span className="px-2 text-[9px] text-red-400 bg-white rounded-full shrink-0">
                          Page break
                        </span>
                        <div className="flex-1 border-t-2 border-dashed border-red-300/50" />
                      </div>
                    ))}
                  </div>

                  {/* Page count indicator */}
                  <div className="text-center py-2">
                    <span className="text-[10px] text-gray-400">
                      {pageCount === 1 ? "Page 1 of 1" : `${pageCount} pages — content exceeds A4`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page entry — provides context                                      */
/* ------------------------------------------------------------------ */

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <EditorProvider resumeId={id}>
      <EditorInner />
    </EditorProvider>
  );
}
