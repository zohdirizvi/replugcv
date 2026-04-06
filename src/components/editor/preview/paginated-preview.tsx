"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import { ResumePreview } from "./resume-preview";
import { SectionToolbar } from "./section-toolbar";

const A4_W = 595;
const A4_H = 842;
const PAGE_GAP = 24;

/**
 * PaginatedPreview — proper page-break algorithm + floating toolbar.
 *
 * Architecture:
 * 1. Content renders ONCE inside a measured container
 * 2. After render, we measure each block's position via blockRefs
 * 3. If a block would cross a page boundary, we inject a CSS spacer
 *    (margin-top) on that block to push it entirely to the next page
 * 4. Page frames are drawn as white backgrounds at A4 intervals
 * 5. SectionToolbar renders OUTSIDE the page as a floating overlay
 * 6. Sticky pagination bar at bottom (only when 2+ pages)
 */
export function PaginatedPreview({ zoom }: { zoom: number }) {
  const {
    designSettings, templateId, selectedBlockId, setSelectedBlockId,
    blockRefs, blocks, reorderBlocks, deleteBlock,
  } = useEditorContext();
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);

  const m = designSettings.margins;
  const usable = A4_H - m.top - m.bottom;

  /* ── Page-break spacer injection ── */
  const injectSpacers = useCallback(() => {
    if (!contentRef.current) return;

    // Get all block elements in order
    const blockEls: HTMLDivElement[] = [];
    const orderedBlocks = blocks.filter((b) => b.is_visible !== false);
    orderedBlocks.forEach((b) => {
      const el = blockRefs.current[b.id];
      if (el) blockEls.push(el);
    });

    // Reset all spacers first
    blockEls.forEach((el) => { el.style.paddingTop = ""; });

    // Measure and inject spacers
    const containerTop = contentRef.current.getBoundingClientRect().top;

    for (const el of blockEls) {
      const rect = el.getBoundingClientRect();
      const blockTop = (rect.top - containerTop) / zoom;
      const blockBottom = blockTop + rect.height / zoom;

      // Which page does this block start on?
      const pageOfTop = Math.floor(blockTop / usable);
      const pageEnd = (pageOfTop + 1) * usable;

      // If block crosses page boundary AND it's not the first item on the page
      if (blockTop < pageEnd && blockBottom > pageEnd && blockTop > pageOfTop * usable + 1) {
        // Push to next page: add spacing to skip remaining space + gap
        const spacerHeight = pageEnd - blockTop + PAGE_GAP + m.top + m.bottom;
        el.style.paddingTop = `${spacerHeight}px`;
      }
    }

    // Re-measure total height for page count
    const totalHeight = contentRef.current.getBoundingClientRect().height / zoom;
    const pages = Math.max(1, Math.ceil(totalHeight / usable));
    setPageCount(pages);
  }, [blocks, blockRefs, usable, zoom, m.top, m.bottom]);

  useEffect(() => {
    // Run spacer injection after render and on resize
    const timer = setTimeout(injectSpacers, 50);
    const el = contentRef.current;
    if (!el) return () => clearTimeout(timer);

    const ro = new ResizeObserver(() => {
      setTimeout(injectSpacers, 30);
    });
    ro.observe(el);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, [injectSpacers]);

  /* ── Toolbar positioning — float outside the page ── */
  useEffect(() => {
    if (!selectedBlockId || !outerRef.current) {
      setToolbarPos(null);
      return;
    }
    const blockEl = blockRefs.current[selectedBlockId];
    if (!blockEl) { setToolbarPos(null); return; }

    const updatePos = () => {
      const outerRect = outerRef.current!.getBoundingClientRect();
      const blockRect = blockEl.getBoundingClientRect();
      setToolbarPos({
        top: blockRect.top - outerRect.top - 32,
        left: blockRect.left - outerRect.left + blockRect.width / 2,
      });
    };

    updatePos();
    // Update on scroll
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updatePos, { passive: true });
      return () => container.removeEventListener("scroll", updatePos);
    }
  }, [selectedBlockId, blockRefs, zoom]);

  /* ── Scroll tracking ── */
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

  /* ── Auto-scroll to selected block's page ── */
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

  const totalH = pageCount * A4_H + (pageCount - 1) * PAGE_GAP;

  // Find selected block for toolbar
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedBlockIdx = selectedBlock ? blocks.indexOf(selectedBlock) : -1;

  return (
    <div ref={outerRef} className="flex-1 flex flex-col min-h-0 relative">
      {/* Floating SectionToolbar — OUTSIDE the page, positioned via absolute */}
      {selectedBlock && toolbarPos && toolbarPos.top > -50 && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            top: toolbarPos.top,
            left: toolbarPos.left,
            transform: "translateX(-50%)",
          }}
        >
          <SectionToolbar
            blockType={selectedBlock.type}
            blockTitle={selectedBlock.title}
            onDelete={() => deleteBlock(selectedBlock.id)}
            onMoveUp={selectedBlockIdx > 0 ? () => reorderBlocks(selectedBlockIdx, selectedBlockIdx - 1) : undefined}
            onMoveDown={selectedBlockIdx < blocks.length - 1 ? () => reorderBlocks(selectedBlockIdx, selectedBlockIdx + 1) : undefined}
            canMoveUp={selectedBlockIdx > 0}
            canMoveDown={selectedBlockIdx < blocks.length - 1}
          />
        </div>
      )}

      {/* Scrollable pages */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col items-center p-6 overflow-y-auto scrollbar-thin"
        onClick={(e) => {
          const t = e.target as HTMLElement;
          // Deselect when clicking background or page frame (not content)
          if (t === scrollRef.current || t.dataset.pageFrame !== undefined) {
            setSelectedBlockId(null);
          }
        }}
      >
        <div className="relative" style={{ width: A4_W * zoom, minHeight: totalH * zoom }}>
          <div style={{ width: A4_W, transform: `scale(${zoom})`, transformOrigin: "top left", height: totalH }}>

            {/* Page frames — white rectangles with shadow */}
            {Array.from({ length: pageCount }).map((_, i) => (
              <div
                key={`pg-${i}`}
                data-page-frame=""
                className="absolute bg-white shadow-lg"
                style={{ top: i * (A4_H + PAGE_GAP), left: 0, width: A4_W, height: A4_H, borderRadius: 4 }}
              >
                {pageCount > 1 && (
                  <span className="absolute select-none pointer-events-none" style={{ bottom: Math.max(8, m.bottom / 3), right: m.right, fontSize: 9, color: "#C4C4CC" }}>
                    {i + 1}
                  </span>
                )}
              </div>
            ))}

            {/* Margin zone overlays — hide content that bleeds into margins */}
            {pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, i) => (
              <div
                key={`ov-${i}`}
                className="absolute pointer-events-none"
                style={{
                  top: (i + 1) * A4_H - m.bottom + (i * PAGE_GAP),
                  left: -2,
                  width: A4_W + 4,
                  height: m.bottom + PAGE_GAP + m.top,
                  backgroundColor: "#F1F5F9",
                  zIndex: 3,
                }}
              />
            ))}

            {/* Content — single render */}
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
                zIndex: 2,
              }}
            >
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky pagination — only when 2+ pages */}
      {pageCount > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-2 py-2 border-t border-[#E2E8F0] bg-white">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i + 1)}
              className="px-3 py-1 rounded-full text-[11px] font-medium border-none cursor-pointer transition-colors"
              style={{
                backgroundColor: activePage === i + 1 ? "#059669" : "#E5E7EB",
                color: activePage === i + 1 ? "#FFF" : "#737373",
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
