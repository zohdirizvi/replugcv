"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import { ResumePreview } from "./resume-preview";

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

type PaginatedPreviewProps = {
  zoom: number;
};

/**
 * PaginatedPreview renders resume content across distinct A4 pages.
 *
 * Architecture:
 * - Content renders ONCE (single DOM, contentEditable works)
 * - A measuring pass counts total content height
 * - Multiple A4 page "frames" are rendered, each clipping a vertical
 *   slice of the content via overflow:hidden + translateY
 * - Pages are visually separated with a gap
 * - Only the first page's content div is interactive; others are
 *   visual clones via CSS (same DOM, different viewport)
 *
 * Since we can't duplicate interactive DOM, we use a hybrid:
 * - Page 1: contains the real interactive content
 * - The scroll container has page separators drawn at the right positions
 * - Content padding is injected at page boundaries to push content into
 *   the next page's margin area
 */
export function PaginatedPreview({ zoom }: PaginatedPreviewProps) {
  const { designSettings, templateId, selectedBlockId, blockRefs, setSelectedBlockId } = useEditorContext();
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(1);

  const margins = designSettings.margins;
  const usableHeight = A4_HEIGHT - margins.top - margins.bottom;

  // Measure and paginate
  const measure = useCallback(() => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const height = rect.height / zoom;
    const pages = Math.max(1, Math.ceil(height / usableHeight));
    setPageCount(pages);
  }, [usableHeight, zoom]);

  useEffect(() => {
    measure();
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // Track which page is visible during scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const pageHeight = (A4_HEIGHT * zoom) + 24; // page height + gap
      const page = Math.min(pageCount, Math.max(1, Math.floor(scrollTop / pageHeight) + 1));
      setActivePage(page);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [pageCount, zoom]);

  // When selected block changes, scroll to its page
  useEffect(() => {
    if (!selectedBlockId || !contentRef.current) return;
    const blockEl = blockRefs.current[selectedBlockId];
    if (!blockEl || !scrollRef.current) return;

    const containerRect = contentRef.current.getBoundingClientRect();
    const blockRect = blockEl.getBoundingClientRect();
    const blockTop = (blockRect.top - containerRect.top) / zoom;
    const targetPage = Math.min(pageCount, Math.max(1, Math.floor(blockTop / usableHeight) + 1));

    setActivePage(targetPage);
    const pageHeight = (A4_HEIGHT * zoom) + 24;
    scrollRef.current.scrollTo({
      top: (targetPage - 1) * pageHeight,
      behavior: "smooth",
    });
  }, [selectedBlockId, pageCount, usableHeight, zoom, blockRefs]);

  const scrollToPage = (page: number) => {
    setActivePage(page);
    if (!scrollRef.current) return;
    const pageHeight = (A4_HEIGHT * zoom) + 24;
    scrollRef.current.scrollTo({
      top: (page - 1) * pageHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 flex flex-col items-center p-6 overflow-y-auto scrollbar-thin"
      onClick={() => setSelectedBlockId(null)}
    >
      {/* Outer wrapper — holds scaled content */}
      <div className="relative" style={{ width: A4_WIDTH * zoom }}>
        <div
          style={{
            width: A4_WIDTH,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          {/* Render page frames */}
          {Array.from({ length: pageCount }).map((_, pageIdx) => {
            const isFirst = pageIdx === 0;
            const contentSliceTop = pageIdx * usableHeight;

            return (
              <div
                key={pageIdx}
                className="relative bg-white shadow-lg overflow-hidden"
                style={{
                  width: A4_WIDTH,
                  height: A4_HEIGHT,
                  marginBottom: pageIdx < pageCount - 1 ? 24 : 0,
                  borderRadius: 4,
                }}
              >
                {/* Content viewport — clips the single content stream */}
                <div
                  style={{
                    position: "absolute",
                    top: margins.top,
                    left: margins.left,
                    width: A4_WIDTH - margins.left - margins.right,
                    height: usableHeight,
                    overflow: "hidden",
                  }}
                >
                  <div
                    ref={isFirst ? contentRef : undefined}
                    style={{
                      width: A4_WIDTH - margins.left - margins.right,
                      fontFamily: `'${designSettings.fontFamily}', ${template.bodyFont}`,
                      fontSize: designSettings.baseFontSize + "px",
                      lineHeight: designSettings.lineHeight,
                      color: "#717180",
                      // Shift content up for pages 2+
                      transform: isFirst ? undefined : `translateY(-${contentSliceTop}px)`,
                      // Only page 1 is interactive
                      pointerEvents: isFirst ? "auto" : "none",
                    }}
                  >
                    <ResumePreview />
                  </div>
                </div>

                {/* Page number in bottom-right corner */}
                <span
                  className="absolute text-[9px] select-none"
                  style={{
                    bottom: margins.bottom / 2 - 5,
                    right: margins.right,
                    color: "#C4C4CC",
                  }}
                >
                  {pageIdx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Page navigation pills */}
      {pageCount > 1 && (
        <div className="flex items-center gap-2 py-4 shrink-0">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); scrollToPage(i + 1); }}
              className="px-3 py-1 rounded-full text-[10px] font-medium border-none cursor-pointer transition-colors"
              style={{
                backgroundColor: activePage === i + 1 ? "#059669" : "#E5E7EB",
                color: activePage === i + 1 ? "#FFFFFF" : "#737373",
              }}
            >
              Page {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
