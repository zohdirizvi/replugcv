"use client";

// Auto-save logic is integrated into EditorProvider (editor-context.tsx)
// with 800ms debounce. This file exists for future extraction if needed.
// Import the context hook to access save status:
export { useEditorContext } from "../editor-context";
