"use client";

import {
  Check,
  X,
  ChevronRight,
  Home03,
  Palette,
  Eye,
  Share01,
  File04,
  ReverseLeft,
  ReverseRight,
} from "@untitledui/icons";
import { useEditorContext } from "./editor-context";
import { usePdfDownload } from "./pdf/use-pdf-download";

export function EditorTopBar() {
  const {
    resume,
    saveStatus,
    editingTitle,
    titleDraft,
    setEditingTitle,
    setTitleDraft,
    saveTitle,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorContext();

  const { downloadPdf, isGenerating } = usePdfDownload();

  if (!resume) return null;

  return (
    <header
      className="flex h-20 shrink-0 items-center justify-between px-6"
      style={{ backgroundColor: "#FAFAFA", borderBottom: "1px solid #E5E5E5" }}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <Home03 className="size-4" style={{ color: "#737373" }} />
        <ChevronRight className="size-3.5" style={{ color: "#A3A3A3" }} />
        <span className="text-sm font-medium" style={{ color: "#737373" }}>
          Resume
        </span>
        <ChevronRight className="size-3.5" style={{ color: "#A3A3A3" }} />

        {/* Editable title */}
        {editingTitle ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setEditingTitle(false);
                  setTitleDraft(resume.title);
                }
              }}
              className="h-8 rounded-md border border-[#059669] bg-white px-2 text-sm font-medium text-[#0A0A0A] outline-none min-w-[140px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              onClick={saveTitle}
              className="flex size-7 items-center justify-center rounded-md bg-transparent border-none cursor-pointer hover:bg-[#E5E5E5] transition-colors"
              style={{ color: "#059669" }}
            >
              <Check className="size-4" />
            </button>
            <button
              onClick={() => {
                setEditingTitle(false);
                setTitleDraft(resume.title);
              }}
              className="flex size-7 items-center justify-center rounded-md bg-transparent border-none cursor-pointer hover:bg-[#E5E5E5] transition-colors"
              style={{ color: "#737373" }}
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="rounded-md bg-transparent border-none cursor-pointer px-1 py-0.5 hover:bg-[#E5E5E5] transition-colors"
          >
            <span
              className="text-sm font-medium"
              style={{ color: "#059669", fontFamily: "'Inter', sans-serif" }}
            >
              {resume.title}
            </span>
          </button>
        )}

        {/* Save status */}
        {saveStatus !== "idle" && (
          <span
            className="text-xs shrink-0 ml-2"
            style={{
              color:
                saveStatus === "saving"
                  ? "#A3A3A3"
                  : saveStatus === "saved"
                  ? "#059669"
                  : "#EF4444",
            }}
          >
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Error saving"}
          </span>
        )}
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex size-10 items-center justify-center rounded-lg bg-transparent border border-[#E5E5E5] cursor-pointer hover:bg-[#E5E5E5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#737373" }}
          title="Undo (Ctrl+Z)"
        >
          <ReverseLeft className="size-5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex size-10 items-center justify-center rounded-lg bg-transparent border border-[#E5E5E5] cursor-pointer hover:bg-[#E5E5E5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#737373" }}
          title="Redo (Ctrl+Shift+Z)"
        >
          <ReverseRight className="size-5" />
        </button>
        <div className="w-px h-6 bg-[#E5E5E5] mx-1" />
        <button
          className="flex size-10 items-center justify-center rounded-lg bg-transparent border border-[#E5E5E5] cursor-pointer hover:bg-[#E5E5E5] transition-colors"
          style={{ color: "#737373" }}
          title="Design"
        >
          <Palette className="size-5" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-lg bg-transparent border border-[#E5E5E5] cursor-pointer hover:bg-[#E5E5E5] transition-colors"
          style={{ color: "#737373" }}
          title="Preview"
        >
          <Eye className="size-5" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-lg bg-transparent border border-[#E5E5E5] cursor-pointer hover:bg-[#E5E5E5] transition-colors"
          style={{ color: "#737373" }}
          title="Share"
        >
          <Share01 className="size-5" />
        </button>
        <button
          onClick={downloadPdf}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#059669" }}
        >
          <File04 className="size-4" />
          {isGenerating ? "Generating..." : "Download"}
        </button>
      </div>
    </header>
  );
}
