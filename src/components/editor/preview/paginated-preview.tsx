"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import { ResumePreview } from "./resume-preview";
import { SectionToolbar } from "./section-toolbar";

const A4_W = 595;
const A4_H = 842;
const PAGE_GAP = 28;

/**
 * PaginatedPreview v3 — Enhancv-quality live editing experience.
 *
 * Principles:
 * - The A4 page looks like a real printed document at ALL times
 * - UI controls (toolbar, add button) float OUTSIDE the page as overlays
 * - Page breaks: spacer injection via marginTop (not paddingTop)
 * - No overlay hacks — spacers push content cleanly to next page
 * - Hover feedback on sections (subtle dotted outline)
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
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const m = designSettings.margins;
  const usable = A4_H - m.top - m.bottom;

  /* ── Page-break spacer injection ──
     After render, measure each block's vertical position.
     If a block would cross a page boundary, add marginTop
     to push it to the next page's content zone.
     Uses marginTop (not paddingTop) so content isn't shifted inside. */
  const injectSpacers = useCallback(() => {
    if (!contentRef.current) return;

    const visibleBlocks = blocks.filter((b) => b.is_visible !== false);
    const blockEls: HTMLDivElement[] = [];
    visibleBlocks.forEach((b) => {
      const el = blockRefs.current[b.id];
      if (el) blockEls.push(el);
    });

    // Reset all injected spacers
    blockEls.forEach((el) => { el.style.marginTop = ""; });

    // Force reflow so measurements are accurate
    void contentRef.current.offsetHeight;

    const containerTop = contentRef.current.getBoundingClientRect().top;

    for (let idx = 0; idx < blockEls.length; idx++) {
      const el = blockEls[idx];
      const rect = el.getBoundingClientRect();
      const blockTop = (rect.top - containerTop) / zoom;
      const blockBottom = blockTop + rect.height / zoom;

      // Which page does this block START on?
      const pageOfTop = Math.floor(blockTop / usable);
      const pageContentEnd = (pageOfTop + 1) * usable;

      // Does the block cross the page boundary?
      if (blockBottom > pageContentEnd && blockTop < pageContentEnd) {
        // How much space remains on current page?
        const remaining = pageContentEnd - blockTop;

        // If less than 25% of the block fits, push entire block to next page
        const blockHeight = blockBottom - blockTop;
        if (remaining < blockHeight * 0.75 || remaining < 40) {
          // marginTop = remaining space on current page + bottom margin + gap + top margin
          const spacer = remaining + m.bottom + PAGE_GAP + m.top;
          el.style.marginTop = `${spacer}px`;
        }
      }
    }

    // Measure final content height for page count
    const totalH = contentRef.current.getBoundingClientRect().height / zoom;
    setPageCount(Math.max(1, Math.ceil(totalH / usable)));
  }, [blocks, blockRefs, usable, zoom, m.top, m.bottom]);

  // Run spacer injection after render, on resize, and on block changes
  useEffect(() => {
    const timer = setTimeout(injectSpacers, 60);
    const el = contentRef.current;
    if (!el) return () => clearTimeout(timer);
    const ro = new ResizeObserver(() => setTimeout(injectSpacers, 40));
    ro.observe(el);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, [injectSpacers]);

  /* ── Toolbar positioning ──
     Calculates toolbar position relative to outerRef.
     Updates on scroll AND on block resize (content changes). */
  const updateToolbarPos = useCallback(() => {
    if (!selectedBlockId || !outerRef.current) { setToolbarPos(null); return; }
    const blockEl = blockRefs.current[selectedBlockId];
    if (!blockEl) { setToolbarPos(null); return; }

    const outerRect = outerRef.current.getBoundingClientRect();
    const blockRect = blockEl.getBoundingClientRect();
    setToolbarPos({
      top: blockRect.top - outerRect.top - 36,
      left: blockRect.left - outerRect.left + blockRect.width / 2,
      width: blockRect.width,
    });
  }, [selectedBlockId, blockRefs]);

  useEffect(() => {
    updateToolbarPos();
    const container = scrollRef.current;
    const blockEl = selectedBlockId ? blockRefs.current[selectedBlockId] : null;

    if (container) {
      container.addEventListener("scroll", updateToolbarPos, { passive: true });
    }
    // Also observe selected block for size changes (user typing)
    let blockRo: ResizeObserver | null = null;
    if (blockEl) {
      blockRo = new ResizeObserver(updateToolbarPos);
      blockRo.observe(blockEl);
    }

    return () => {
      container?.removeEventListener("scroll", updateToolbarPos);
      blockRo?.disconnect();
    };
  }, [updateToolbarPos, selectedBlockId, blockRefs]);

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

  /* ── Auto-scroll to selected block ── */
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
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedBlockIdx = selectedBlock ? blocks.indexOf(selectedBlock) : -1;

  return (
    <div ref={outerRef} className="flex-1 flex flex-col min-h-0 relative">

      {/* ── Floating toolbar — OUTSIDE the page frame ── */}
      {selectedBlock && toolbarPos && toolbarPos.top > 0 && (
        <div
          className="absolute z-50"
          style={{ top: toolbarPos.top, left: toolbarPos.left, transform: "translateX(-50%)" }}
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

      {/* ── Scrollable preview area ── */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col items-center py-8 px-6 overflow-y-auto scrollbar-thin"
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (t === scrollRef.current || t.dataset.pageFrame !== undefined) {
            setSelectedBlockId(null);
          }
        }}
      >
        <div className="relative" style={{ width: A4_W * zoom, minHeight: totalH * zoom }}>
          <div style={{ width: A4_W, transform: `scale(${zoom})`, transformOrigin: "top left", height: totalH }}>

            {/* Page frames — white A4 rectangles */}
            {Array.from({ length: pageCount }).map((_, i) => (
              <div
                key={`pg-${i}`}
                data-page-frame=""
                className="absolute bg-white"
                style={{
                  top: i * (A4_H + PAGE_GAP),
                  left: 0,
                  width: A4_W,
                  height: A4_H,
                  borderRadius: 3,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                {pageCount > 1 && (
                  <span className="absolute select-none pointer-events-none" style={{ bottom: Math.max(8, m.bottom / 3), right: m.right, fontSize: 9, color: "#D4D4D4" }}>
                    {i + 1}
                  </span>
                )}
              </div>
            ))}

            {/* Content — single render, flows naturally with spacers */}
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
          </div>
        </div>
      </div>

      {/* ── Sticky page navigation — only when 2+ pages ── */}
      {pageCount > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-2 py-2 border-t border-[#E5E7EB] bg-white">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i + 1)}
              className="size-7 rounded-full text-[11px] font-semibold border-none cursor-pointer transition-colors"
              style={{
                backgroundColor: activePage === i + 1 ? "#059669" : "#F3F4F6",
                color: activePage === i + 1 ? "#FFF" : "#737373",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
