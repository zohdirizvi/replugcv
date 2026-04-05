"use client";

import { use, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { EditorProvider, useEditorContext } from "@/components/editor/editor-context";
import { EditorTopBar } from "@/components/editor/editor-top-bar";
import { LeftPanel } from "@/components/editor/panels/left-panel";
import { PaginatedPreview } from "@/components/editor/preview/paginated-preview";
import { StepForm } from "@/components/editor/wizard/step-form";
import { TEMPLATES } from "@/components/editor/constants";

/* ------------------------------------------------------------------ */
/*  Inner layout — consumes context                                    */
/* ------------------------------------------------------------------ */

function EditorInner() {
  const router = useRouter();
  const { loading, resume, currentStep, goNextStep, goPrevStep, templateId, zoom, setZoom, designSettings } = useEditorContext();

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  /* Page count is tracked by PaginatedPreview internally */

  /* --- Resizable split panels --- */
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(45); // 45% form, 55% preview
  const [isDragging, setIsDragging] = useState(false);


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
              </div>
            </div>

            {/* Paginated preview — handles pages, scrolling, navigation */}
            <PaginatedPreview zoom={zoom} />
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
