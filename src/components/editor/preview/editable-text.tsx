"use client";

import { useRef, useState, useCallback, useEffect, type KeyboardEvent, type ClipboardEvent } from "react";
import { cx } from "@/utils/cx";

type EditableTextProps = {
  value: string;
  placeholder: string;
  onSave: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
  showToolbar?: boolean; // only true for summary/description fields
  tag?: "h1" | "h2" | "p" | "span" | "li";
  placeholderClassName?: string;
  style?: React.CSSProperties;
  /** AI-editable field identifier — when set, an AI CTA will render based on user plan */
  aiField?: string;
};

/* ---- Mini formatting toolbar (B/I/U/Link) ---- */
function FormatToolbar({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const apply = useCallback(
    (cmd: string, val?: string) => {
      targetRef.current?.focus();
      document.execCommand(cmd, false, val);
    },
    [targetRef]
  );

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) apply("createLink", url);
  }, [apply]);

  return (
    <div
      className="absolute -top-8 left-0 z-30 flex items-center gap-0.5 rounded border border-[#E5E5E5] bg-white px-0.5 py-0.5 shadow-md"
      data-format-toolbar
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); apply("bold"); }}
        className="flex size-6 items-center justify-center rounded text-[11px] font-bold text-gray-600 hover:bg-gray-100 cursor-pointer border-none bg-transparent"
        title="Bold"
      >B</button>
      <button
        onMouseDown={(e) => { e.preventDefault(); apply("italic"); }}
        className="flex size-6 items-center justify-center rounded text-[11px] italic text-gray-600 hover:bg-gray-100 cursor-pointer border-none bg-transparent"
        title="Italic"
      >I</button>
      <button
        onMouseDown={(e) => { e.preventDefault(); apply("underline"); }}
        className="flex size-6 items-center justify-center rounded text-[11px] underline text-gray-600 hover:bg-gray-100 cursor-pointer border-none bg-transparent"
        title="Underline"
      >U</button>
      <div className="w-px h-3.5 bg-gray-200" />
      <button
        onMouseDown={(e) => { e.preventDefault(); handleLink(); }}
        className="flex size-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 cursor-pointer border-none bg-transparent"
        title="Add link"
      >
        <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6.5 9.5l3-3M7 12l-1.5 1.5a2.12 2.12 0 01-3-3L4 9m5-5l1.5-1.5a2.12 2.12 0 013 3L12 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ---- Main EditableText ---- */
export function EditableText({
  value,
  placeholder,
  onSave,
  className = "",
  multiline = false,
  showToolbar = false,
  tag: Tag = "span",
  placeholderClassName = "",
  style,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [hasContent, setHasContent] = useState(!!value);

  const isBlockTag = Tag === "h1" || Tag === "h2" || Tag === "p" || Tag === "li";

  // Sync external changes when not editing
  useEffect(() => {
    if (!editing) {
      setHasContent(!!value);
      if (ref.current && ref.current.textContent !== value) {
        ref.current.textContent = value || "";
      }
    }
  }, [value, editing]);

  const handleFocus = useCallback(() => {
    setEditing(true);
    // If empty, clear placeholder text so user can type fresh
    if (!hasContent && ref.current) {
      ref.current.textContent = "";
    }
  }, [hasContent]);

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (related && related.closest("[data-format-toolbar]")) return;

      setEditing(false);
      const text = ref.current?.textContent?.trim() || "";
      setHasContent(!!text);
      if (text !== value) {
        onSave(text);
      }
      // If empty after editing, restore placeholder display
      if (!text && ref.current) {
        ref.current.textContent = "";
      }
    },
    [value, onSave]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        ref.current?.blur();
      }
      if (e.key === "Escape") {
        if (ref.current) ref.current.textContent = value;
        ref.current?.blur();
      }
    },
    [multiline, value]
  );

  const handlePaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const handleInput = useCallback(() => {
    const text = ref.current?.textContent || "";
    setHasContent(!!text.trim());
  }, []);

  const showPlaceholder = !hasContent;

  const editableElement = (
    <Tag
      ref={ref as React.Ref<never>}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onInput={handleInput}
      className={cx(
        "outline-none rounded transition-all cursor-text",
        editing && "ring-1 ring-[#059669] bg-white py-0.5 px-1",
        className,
        showPlaceholder && !editing && placeholderClassName
      )}
      data-placeholder={placeholder}
      style={{
        ...style,
        display: isBlockTag ? "block" : "inline-block",
        width: isBlockTag ? "100%" : undefined,
        minWidth: showPlaceholder && !isBlockTag ? "60px" : undefined,
        minHeight: "1.2em",
        maxWidth: "100%",
        wordBreak: "break-word" as const,
        overflowWrap: "break-word" as const,
        ...(showPlaceholder && !editing
          ? { color: "#9CA3AF", fontStyle: "italic" as const }
          : {}),
      }}
    >
      {showPlaceholder && !editing ? placeholder : (hasContent ? value : "")}
    </Tag>
  );

  // When showToolbar is true, wrap with a relative container for toolbar positioning
  if (showToolbar) {
    return (
      <div
        className="relative"
        style={{
          display: isBlockTag ? "block" : "inline-block",
          width: isBlockTag ? "100%" : undefined,
        }}
      >
        {editing && <FormatToolbar targetRef={ref} />}
        {editableElement}
      </div>
    );
  }

  // No toolbar — render the Tag directly with no wrapper
  return editableElement;
}
