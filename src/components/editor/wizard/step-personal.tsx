"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorContext } from "../editor-context";

export function StepPersonal() {
  const { blocks, updateBlockContent, ensureBlock } = useEditorContext();

  const headerBlock = blocks.find((b) => b.type === "header");
  const contactBlock = blocks.find((b) => b.type === "contact");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!headerBlock) ensureBlock("header");
    if (!contactBlock) ensureBlock("contact");
  }, [headerBlock, contactBlock, ensureBlock]);

  const hc = (headerBlock?.content as Record<string, unknown>) || {};
  const cc = (contactBlock?.content as Record<string, unknown>) || {};

  const setHeader = (key: string, value: string) => {
    if (!headerBlock) return;
    updateBlockContent(headerBlock.id, { ...hc, [key]: value });
  };

  const setContact = (key: string, value: string) => {
    if (!contactBlock) return;
    updateBlockContent(contactBlock.id, { ...cc, [key]: value });
  };

  /* Website synced between header and contact */
  const setWebsite = useCallback(
    (value: string) => {
      if (headerBlock) updateBlockContent(headerBlock.id, { ...hc, website: value });
      if (contactBlock) updateBlockContent(contactBlock.id, { ...cc, website: value });
    },
    [headerBlock, contactBlock, hc, cc, updateBlockContent]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !headerBlock) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        updateBlockContent(headerBlock.id, { ...hc, headerImage: dataUrl });
      };
      reader.readAsDataURL(file);
    },
    [headerBlock, hc, updateBlockContent]
  );

  const removeImage = useCallback(() => {
    if (!headerBlock) return;
    updateBlockContent(headerBlock.id, { ...hc, headerImage: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [headerBlock, hc, updateBlockContent]);

  const headerImage = (hc.headerImage as string) || "";
  const headerImageShape = (hc.headerImageShape as string) || "circle";

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <h2 className="text-lg font-semibold text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
        Personal details
      </h2>
      <p className="text-sm text-[#737373] -mt-3">
        Please provide your name and contact information.
      </p>

      {/* Profile Picture */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#404040]">Profile picture (optional)</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center border-2 border-dashed border-[#D4D4D4] bg-[#FAFAFA] cursor-pointer hover:border-[#059669] transition-colors overflow-hidden shrink-0"
            style={{
              width: 80,
              height: 80,
              borderRadius: headerImageShape === "circle" ? "50%" : 8,
            }}
          >
            {headerImage ? (
              <img
                src={headerImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="size-6 text-[#A3A3A3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="imageShape"
                  checked={headerImageShape === "circle"}
                  onChange={() => setHeader("headerImageShape", "circle")}
                  className="accent-[#059669]"
                />
                <span className="text-xs text-[#404040]">Circle</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="imageShape"
                  checked={headerImageShape === "square"}
                  onChange={() => setHeader("headerImageShape", "square")}
                  className="accent-[#059669]"
                />
                <span className="text-xs text-[#404040]">Square</span>
              </label>
            </div>
            {headerImage && (
              <button
                type="button"
                onClick={removeImage}
                className="text-xs text-red-500 bg-transparent border-none cursor-pointer p-0 text-left hover:text-red-700 transition-colors"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          Full name <span style={{ color: "#7F56D9" }}>*</span>
        </label>
        <input
          type="text"
          value={(hc.name as string) || ""}
          onChange={(e) => setHeader("name", e.target.value)}
          placeholder="e.g. John Doe"
          className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
      </div>

      {/* Job Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          Job title <span style={{ color: "#7F56D9" }}>*</span>
        </label>
        <input
          type="text"
          value={(hc.title as string) || ""}
          onChange={(e) => setHeader("title", e.target.value)}
          placeholder="e.g. Senior Product Designer"
          className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          Email <span style={{ color: "#7F56D9" }}>*</span>
        </label>
        <input
          type="email"
          value={(cc.email as string) || ""}
          onChange={(e) => setContact("email", e.target.value)}
          placeholder="e.g. john@example.com"
          className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          Phone
        </label>
        <input
          type="tel"
          value={(cc.phone as string) || ""}
          onChange={(e) => setContact("phone", e.target.value)}
          placeholder="e.g. +1 (555) 000-0000"
          className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          Location
        </label>
        <input
          type="text"
          value={(cc.location as string) || ""}
          onChange={(e) => setContact("location", e.target.value)}
          placeholder="e.g. San Francisco, CA"
          className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
      </div>

      {/* Website */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          Website (optional)
        </label>
        <input
          type="url"
          value={(cc.website as string) || (hc.website as string) || ""}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
      </div>

      {/* LinkedIn URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#404040]">
          LinkedIn URL
        </label>
        <input
          type="url"
          value={(cc.linkedin as string) || ""}
          onChange={(e) => setContact("linkedin", e.target.value)}
          placeholder="e.g. linkedin.com/in/johndoe"
          className="h-11 rounded-lg border border-[#D4D4D4] bg-white px-3.5 text-base text-[#0A0A0A] outline-none transition-colors focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 placeholder:text-[#737373] shadow-xs"
        />
      </div>
    </div>
  );
}
