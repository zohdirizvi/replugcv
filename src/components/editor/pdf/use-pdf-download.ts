"use client";

import { useState, useCallback } from "react";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";

export function usePdfDownload() {
  const { blocks, templateId, resume, userPlan, designSettings } = useEditorContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPdf = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // Dynamic imports to avoid SSR issues
      const [{ pdf }, { PdfDocument }, { registerFonts }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./pdf-document"),
        import("./register-fonts"),
      ]);

      registerFonts();

      const templateStyles = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
      const title = resume?.title || "Resume";

      const blob = await pdf(
        PdfDocument({ blocks, templateStyles, designSettings, userPlan })
      ).toBlob();

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resume - ${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [blocks, templateId, resume, userPlan, designSettings, isGenerating]);

  return { downloadPdf, isGenerating };
}
