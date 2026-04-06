"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import { ResumePreview } from "./resume-preview";

const A4_W = 595;
const A4_H = 842;
const PAGE_GAP = 32; // visual gap between pages

type PaginatedPreviewProps = { zoom: number };

/**
 * PaginatedPreview — single-DOM render with visual page clipping.
 *
 * Content renders ONCE (no duplicate React trees / contentEditable).
 * White overlay bars cover the margin zones between pages so content
 * that crosses a page boundary is visually hidden (Google Docs approach).
 * Each page shows its own margins, page number, and shadow.
 */
export function PaginatedPreview({ zoom }: PaginatedPreviewProps) {
  const { designSettings, templateId, selectedBlockId, blockRefs, setSelectedBlockId } = useEditorContext();
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(1);

  const m = designSettings.margins;
  const usable = A4_H - m.top - m.bottom;

  // Measure content → page count
  const measure = useCallback(() => {
    if (!contentRef.current) return;
    const h = contentRef.current.getBoundingClientRect().height / zoom;
    setPageCount(Math.max(1, Math.ceil(h / usable)));
  }, [usable, zoom]);

  useEffect(() => {
    measure();
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // Track active page on scroll
  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const onScroll = () => {
      const pgH = (A4_H + PAGE_GAP) * zoom;
      setActivePage(Math.min(pageCount, Math.max(1, Math.floor(c.scrollTop / pgH) + 1)));
    };
    c.addEventListener("scroll", onScroll, { passive: true });
    return () => c.removeEventListener("scroll", onScroll);
  }, [pageCount, zoom]);

  // Auto-scroll to page containing selected block
  useEffect(() => {
    if (!selectedBlockId || !contentRef.current || !scrollRef.current) return;
    const el = blockRefs.current[selectedBlockId];
    if (!el) return;
    const cRect = contentRef.current.getBoundingClientRect();
    const bRect = el.getBoundingClientRect();
    const blockTop = (bRect.top - cRect.top) / zoom;
    const pg = Math.min(pageCount, Math.max(1, Math.floor(blockTop / usable) + 1));
    setActivePage(pg);
    scrollRef.current.scrollTo({ top: (pg - 1) * (A4_H + PAGE_GAP) * zoom, behavior: "smooth" });
  }, [selectedBlockId, pageCount, usable, zoom, blockRefs]);

  const scrollToPage = (pg: number) => {
    setActivePage(pg);
    scrollRef.current?.scrollTo({ top: (pg - 1) * (A4_H + PAGE_GAP) * zoom, behavior: "smooth" });
  };

  // Total scaled height (for the outer wrapper sizing)
  const totalH = pageCount * A4_H + (pageCount - 1) * PAGE_GAP;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Scrollable pages area */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col items-center p-6 overflow-y-auto scrollbar-thin"
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (t === scrollRef.current || t.dataset.pageOverlay !== undefined || t.dataset.pageFrame !== undefined) {
            setSelectedBlockId(null);
          }
        }}
      >
        <div className="relative" style={{ width: A4_W * zoom, minHeight: totalH * zoom }}>
          <div style={{ width: A4_W, transform: `scale(${zoom})`, transformOrigin: "top left", height: totalH }}>

            {/* ── Page frames (white backgrounds + shadows) ── */}
            {Array.from({ length: pageCount }).map((_, i) => (
              <div
                key={`frame-${i}`}
                data-page-frame=""
                className="absolute bg-white shadow-lg"
                style={{ top: i * (A4_H + PAGE_GAP), left: 0, width: A4_W, height: A4_H, borderRadius: 4 }}
              >
                {/* Page number bottom-right */}
                {pageCount > 1 && (
                  <span className="absolute select-none pointer-events-none" style={{ bottom: Math.max(8, m.bottom / 3), right: m.right, fontSize: 9, color: "#C4C4CC" }}>
                    {i + 1}
                  </span>
                )}
              </div>
            ))}

            {/* ── Content: renders ONCE, flows naturally ── */}
            <div
              ref={contentRef}
              style={{
                position: "absolute",
                top: m.top,
                left: m.left,
                width: A4_W - m.left - m.right,
                fontFamily: `'${designSettings.fontFamily}', ${template.bodyFont}`,
                fontSize: designSettings.baseFontSize + "px",
                lineHeight: designSettings.lineHeight,
                color: "#717180",
                zIndex: 1,
              }}
            >
              <ResumePreview />
            </div>

            {/* ── Margin overlays: white bars that hide content in margin zones ──
                 Between page N bottom and page N+1 top, draw a white bar that
                 covers: page N's bottom margin + gap + page N+1's top margin.
                 This visually clips content at page boundaries. ── */}
            {pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, i) => {
              const overlayTop = (i + 1) * A4_H - m.bottom + (i * PAGE_GAP);
              const overlayHeight = m.bottom + PAGE_GAP + m.top;
              return (
                <div
                  key={`overlay-${i}`}
                  data-page-overlay=""
                  className="absolute"
                  style={{
                    top: overlayTop,
                    left: -4,
                    width: A4_W + 8,
                    height: overlayHeight,
                    backgroundColor: "#F1F5F9", // matches preview background
                    zIndex: 2,
                  }}
                />
              );
            })}

            {/* ── Top margin overlay for page 1 (hide content above top margin) ── */}
            <div className="absolute" style={{ top: -4, left: -4, width: A4_W + 8, height: m.top + 4, backgroundColor: "#F1F5F9", zIndex: 0 }} />

          </div>
        </div>
      </div>

      {/* ── Sticky pagination bar — only when 2+ pages ── */}
      {pageCount > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-2 py-2 border-t border-[#E2E8F0] bg-white/90 backdrop-blur-sm">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i + 1)}
              className="px-3 py-1 rounded-full text-[11px] font-medium border-none cursor-pointer transition-colors"
              style={{
                backgroundColor: activePage === i + 1 ? "#059669" : "#E5E7EB",
                color: activePage === i + 1 ? "#FFFFFF" : "#737373",
              }}
            >
              {i + 1}
            </button>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">{pageCount} pages</span>
        </div>
      )}
    </div>
  );
}
