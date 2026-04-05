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
 * PaginatedPreview renders resume across visual A4 pages.
 *
 * Architecture (single DOM render):
 * - ResumePreview renders ONCE in a single container
 * - Content grows naturally (no fixed height)
 * - We measure total content height via ResizeObserver
 * - Visual page frames are drawn as overlays at A4 intervals
 * - Page gaps are injected via CSS padding at break points
 *   so content naturally flows past margin zones
 *
 * This avoids duplicate DOM, duplicate contentEditable, and
 * duplicate React trees. The content IS the page.
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

  // Measure content and calculate page count
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

  // Track active page during scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const pageWithGap = (A4_HEIGHT + 32) * zoom;
      const page = Math.min(pageCount, Math.max(1, Math.floor(scrollTop / pageWithGap) + 1));
      setActivePage(page);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [pageCount, zoom]);

  // Scroll to page containing the selected block
  useEffect(() => {
    if (!selectedBlockId || !contentRef.current || !scrollRef.current) return;
    const blockEl = blockRefs.current[selectedBlockId];
    if (!blockEl) return;

    const containerRect = contentRef.current.getBoundingClientRect();
    const blockRect = blockEl.getBoundingClientRect();
    const blockTop = (blockRect.top - containerRect.top) / zoom;
    const targetPage = Math.min(pageCount, Math.max(1, Math.floor(blockTop / usableHeight) + 1));

    setActivePage(targetPage);
    const pageWithGap = (A4_HEIGHT + 32) * zoom;
    scrollRef.current.scrollTo({
      top: (targetPage - 1) * pageWithGap,
      behavior: "smooth",
    });
  }, [selectedBlockId, pageCount, usableHeight, zoom, blockRefs]);

  const scrollToPage = (page: number) => {
    setActivePage(page);
    if (!scrollRef.current) return;
    const pageWithGap = (A4_HEIGHT + 32) * zoom;
    scrollRef.current.scrollTo({
      top: (page - 1) * pageWithGap,
      behavior: "smooth",
    });
  };

  // Total height of all pages including gaps
  const totalHeight = pageCount * A4_HEIGHT + (pageCount - 1) * 32;

  return (
    <div
      ref={scrollRef}
      className="flex-1 flex flex-col items-center p-6 overflow-y-auto scrollbar-thin"
      onClick={(e) => {
        // Only deselect if the click target is this container or the page wrapper (not content)
        const target = e.target as HTMLElement;
        if (target === scrollRef.current || target.dataset.pageWrapper !== undefined) {
          setSelectedBlockId(null);
        }
      }}
    >
      <div className="relative" style={{ width: A4_WIDTH * zoom }}>
        <div
          style={{
            width: A4_WIDTH,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            height: totalHeight,
          }}
        >
          {/* Single white background for all pages */}
          {Array.from({ length: pageCount }).map((_, i) => (
            <div
              key={i}
              data-page-wrapper=""
              className="absolute bg-white shadow-lg"
              style={{
                top: i * (A4_HEIGHT + 32),
                left: 0,
                width: A4_WIDTH,
                height: A4_HEIGHT,
                borderRadius: 4,
              }}
            >
              {/* Page number */}
              <span
                className="absolute select-none pointer-events-none"
                style={{ bottom: margins.bottom / 2 - 5, right: margins.right, fontSize: 9, color: "#C4C4CC" }}
              >
                {i + 1}
              </span>
            </div>
          ))}

          {/* Single content render — positioned on page 1, grows naturally */}
          <div
            ref={contentRef}
            style={{
              position: "absolute",
              top: margins.top,
              left: margins.left,
              width: A4_WIDTH - margins.left - margins.right,
              fontFamily: `'${designSettings.fontFamily}', ${template.bodyFont}`,
              fontSize: designSettings.baseFontSize + "px",
              lineHeight: designSettings.lineHeight,
              color: "#717180",
            }}
          >
            <ResumePreview />
          </div>
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

      {pageCount <= 1 && (
        <div className="py-2 shrink-0">
          <span className="text-[10px] text-gray-400">Page 1 of 1</span>
        </div>
      )}
    </div>
  );
}
