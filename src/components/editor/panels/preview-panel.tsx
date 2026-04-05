"use client";

import { Plus, Edit03 } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import { ResumePreview } from "../preview/resume-preview";

export function PreviewPanel() {
  const { zoom, addBlock, templateId } = useEditorContext();

  const style = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  return (
    <div className="relative flex flex-1 flex-col" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="flex-1 overflow-y-auto p-8">
        <div
          className="mx-auto origin-top relative"
          style={{
            width: 595 * zoom,
            minHeight: 842 * zoom,
          }}
        >
          {/* Corner resize handles */}
          <div className="absolute -top-1 -left-1 size-2 border border-gray-300 bg-white rounded-sm z-10" />
          <div className="absolute -top-1 -right-1 size-2 border border-gray-300 bg-white rounded-sm z-10" />
          <div className="absolute -bottom-1 -left-1 size-2 border border-gray-300 bg-white rounded-sm z-10" />
          <div className="absolute -bottom-1 -right-1 size-2 border border-gray-300 bg-white rounded-sm z-10" />

          {/* Edit button floating at top right of paper */}
          <button
            className="absolute -top-3 -right-3 z-10 flex size-7 items-center justify-center rounded-full bg-[#8B5CF6] text-white shadow-md border-none cursor-pointer hover:opacity-90 transition-opacity"
            title="Edit"
          >
            <Edit03 className="size-3.5" />
          </button>

          <div
            className="bg-white shadow-lg rounded-sm"
            style={{
              width: 595,
              minHeight: 842,
              padding: 40,
              fontFamily: style.bodyFont,
              color: "#111827",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <ResumePreview />
          </div>
        </div>
      </div>

      {/* Floating + button centered below the paper */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => addBlock("custom")}
          className="flex size-10 items-center justify-center rounded-full border-none text-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#8B5CF6" }}
          title="Add section"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
}
