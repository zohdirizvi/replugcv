"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/base/buttons/button";
import {
  Plus,
  Trash01,
  File06,
  Copy01,
  Star01,
  Grid01,
  List,
  ChevronDown,
  Stars01,
  Globe01,
  DotsVertical,
} from "@untitledui/icons";
import { cx } from "@/utils/cx";

/* ── Types ── */

type ResumeBlock = {
  type: string;
  title: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
};

type Resume = {
  id: string;
  title: string;
  status: string;
  is_base: boolean;
  parent_id: string | null;
  job_title: string | null;
  job_company: string | null;
  ats_score: number | null;
  updated_at: string;
  created_at: string;
  data?: Record<string, unknown> | null;
};

type ResumeWithBlocks = Resume & {
  blocks: ResumeBlock[];
};

/* ── Helpers ── */

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 30) return "Just now";
  if (diffMin < 1) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  // Same year: "Mar 15"
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Different year: "Mar 15, 2025"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Scaled A4 Preview Container ── */

function ScaledA4Preview({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const updateScale = () => {
      const scale = container.offsetWidth / A4_W;
      inner.style.transform = `scale(${scale})`;
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full bg-white"
      style={{ aspectRatio: `${A4_W} / ${A4_H}` }}
    >
      <div
        ref={innerRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: A4_W, height: A4_H }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Resume Card Thumbnail ── */

/*
  Renders a full A4 page (595×842) scaled down to fit the card.
  The card container sets the visible size; the inner div renders at
  full A4 then CSS-transforms to fit. This produces a crisp, readable
  miniature exactly like Builder.io's resume cards.
*/

const A4_W = 595;
const A4_H = 842;

function ResumeCardThumbnail({ blocks, accentColor }: { blocks: ResumeBlock[]; accentColor: string }) {
  const visible = blocks.filter((b) => b.is_visible !== false).sort((a, b) => a.sort_order - b.sort_order);
  const header = visible.find((b) => b.type === "header");
  const contact = visible.find((b) => b.type === "contact");
  const summary = visible.find((b) => b.type === "summary");
  const experience = visible.find((b) => b.type === "experience");
  const education = visible.find((b) => b.type === "education");
  const skills = visible.find((b) => b.type === "skills");

  const name = (header?.content?.name as string) || "";
  const title = (header?.content?.title as string) || "";
  const contactFields = contact?.content || {};
  const summaryText = (summary?.content?.text as string) || "";
  const expItems = (experience?.content?.items as Array<Record<string, unknown>>) || [];
  const eduItems = (education?.content?.items as Array<Record<string, unknown>>) || [];
  const skillItems = (skills?.content?.items as string[]) || [];

  const hasContent = name || title || summaryText || expItems.length > 0;

  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        lineHeight: 1.5,
        padding: 40,
        color: "#717180",
        backgroundColor: "#FFFFFF",
      }}
    >
      {!hasContent ? (
        /* Empty wireframe */
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 20 }}>
          <div style={{ width: "55%", height: 10, borderRadius: 3, backgroundColor: "#E5E7EB" }} />
          <div style={{ width: "35%", height: 7, borderRadius: 3, backgroundColor: "#F3F4F6" }} />
          <div style={{ width: "100%", height: 1, backgroundColor: "#F3F4F6", margin: "8px 0" }} />
          <div style={{ width: "30%", height: 6, borderRadius: 3, backgroundColor: "#E5E7EB" }} />
          <div style={{ width: "100%", height: 5, borderRadius: 3, backgroundColor: "#F3F4F6" }} />
          <div style={{ width: "90%", height: 5, borderRadius: 3, backgroundColor: "#F3F4F6" }} />
          <div style={{ width: "75%", height: 5, borderRadius: 3, backgroundColor: "#F3F4F6" }} />
          <div style={{ width: "100%", height: 1, backgroundColor: "#F3F4F6", margin: "8px 0" }} />
          <div style={{ width: "25%", height: 6, borderRadius: 3, backgroundColor: "#E5E7EB" }} />
          <div style={{ width: "100%", height: 5, borderRadius: 3, backgroundColor: "#F3F4F6" }} />
          <div style={{ width: "85%", height: 5, borderRadius: 3, backgroundColor: "#F3F4F6" }} />
          <div style={{ width: "65%", height: 5, borderRadius: 3, backgroundColor: "#F3F4F6" }} />
        </div>
      ) : (
        <>
          {name && <p style={{ fontSize: 20, fontWeight: 600, color: accentColor, lineHeight: 1.2, margin: 0 }}>{name}</p>}
          {title && <p style={{ fontSize: 14, fontWeight: 500, color: "#717180", marginTop: 2 }}>{title}</p>}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginTop: 8 }}>
            {["email", "phone", "location", "website", "linkedin"].map((key) => {
              const val = contactFields[key] as string;
              if (!val) return null;
              return <span key={key} style={{ fontSize: 10, color: "#717180" }}><span style={{ color: accentColor }}>{"\u2022 "}</span>{val}</span>;
            })}
          </div>

          <div style={{ borderBottom: "1px solid #E5E7EB", margin: "12px 0" }} />

          {summaryText && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: accentColor, marginBottom: 4 }}>Summary</p>
              <p style={{ fontSize: 11, color: "#717180", lineHeight: 1.5 }}>{summaryText.length > 250 ? summaryText.slice(0, 250) + "..." : summaryText}</p>
              <div style={{ borderBottom: "1px solid #E5E7EB", margin: "12px 0" }} />
            </>
          )}

          {eduItems.length > 0 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: accentColor, marginBottom: 6 }}>Education</p>
              {eduItems.slice(0, 2).map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#717180" }}>{(item.degree as string) || ""}</p>
                    <p style={{ fontSize: 11, color: "#717180" }}>{(item.school as string) || ""}</p>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "#717180", flexShrink: 0 }}>
                    {(item.startYear as string) || ""}{(item.startYear as string) && (item.endYear as string) ? " - " : ""}{(item.endYear as string) || ""}
                  </p>
                </div>
              ))}
              <div style={{ borderBottom: "1px solid #E5E7EB", margin: "12px 0" }} />
            </>
          )}

          {expItems.length > 0 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: accentColor, marginBottom: 6 }}>Experience</p>
              {expItems.slice(0, 3).map((item, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#717180" }}>
                      {(item.role as string) || ""}{(item.role as string) && (item.company as string) ? ", " : ""}{(item.company as string) || ""}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 500, color: "#717180", flexShrink: 0 }}>
                      {(item.startDate as string) || ""}{(item.startDate as string) && (item.endDate as string) ? " - " : ""}{(item.endDate as string) || ""}
                    </p>
                  </div>
                  {(item.description as string) && (
                    <p style={{ fontSize: 10, color: "#717180", marginTop: 3, lineHeight: 1.5 }}>
                      {((item.description as string) || "").slice(0, 180)}{((item.description as string) || "").length > 180 ? "..." : ""}
                    </p>
                  )}
                </div>
              ))}
              <div style={{ borderBottom: "1px solid #E5E7EB", margin: "12px 0" }} />
            </>
          )}

          {skillItems.length > 0 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: accentColor, marginBottom: 4 }}>Skills</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#717180" }}>{skillItems.join(", ")}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ── Main Dashboard ── */

export default function DashboardPage() {
  const [resumes, setResumes] = useState<ResumeWithBlocks[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [userName, setUserName] = useState("User");
  const [activeTab, setActiveTab] = useState<"recent" | "shared">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUserName(session.user.user_metadata?.full_name || "User");

    const { data: resumeData } = await supabase
      .from("resumes")
      .select("id, title, status, is_base, parent_id, job_title, job_company, ats_score, updated_at, created_at, data")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (!resumeData || resumeData.length === 0) {
      setResumes([]);
      setLoading(false);
      return;
    }

    // Fetch blocks for all resumes in one query
    const resumeIds = resumeData.map((r) => r.id);
    const { data: allBlocks } = await supabase
      .from("resume_blocks")
      .select("resume_id, type, title, content, sort_order, is_visible")
      .in("resume_id", resumeIds);

    const blocksByResume = new Map<string, ResumeBlock[]>();
    (allBlocks || []).forEach((b) => {
      const existing = blocksByResume.get(b.resume_id) || [];
      existing.push(b);
      blocksByResume.set(b.resume_id, existing);
    });

    const resumesWithBlocks: ResumeWithBlocks[] = resumeData.map((r) => ({
      ...r,
      blocks: blocksByResume.get(r.id) || [],
    }));

    setResumes(resumesWithBlocks);
    setLoading(false);
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [menuOpen]);

  async function createResume() {
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: session.user.id, title: "Untitled Resume", status: "draft" })
      .select("id")
      .single();

    if (error) { alert("Error creating resume: " + error.message); setCreating(false); return; }

    const defaultBlocks = [
      { resume_id: data.id, type: "header", title: "Header", sort_order: 0, content: { name: "", title: "", summary: "" } },
      { resume_id: data.id, type: "contact", title: "Contact", sort_order: 1, content: { email: "", phone: "", location: "", website: "", linkedin: "" } },
      { resume_id: data.id, type: "summary", title: "Summary", sort_order: 2, content: { text: "" } },
      { resume_id: data.id, type: "experience", title: "Experience", sort_order: 3, content: { items: [] } },
      { resume_id: data.id, type: "education", title: "Education", sort_order: 4, content: { items: [] } },
      { resume_id: data.id, type: "skills", title: "Skills", sort_order: 5, content: { items: [] } },
    ];

    await supabase.from("resume_blocks").insert(defaultBlocks);
    setCreating(false);

    window.location.href = `/editor/${data.id}`;
  }

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    await supabase.from("resumes").delete().eq("id", deleteTarget.id);
    setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  async function duplicateResume(resume: ResumeWithBlocks) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: newResume } = await supabase
      .from("resumes")
      .insert({
        user_id: session.user.id,
        title: `${resume.title} (Copy)`,
        parent_id: resume.is_base ? resume.id : resume.parent_id,
        status: "draft",
      })
      .select("id")
      .single();

    if (!newResume) return;

    if (resume.blocks.length > 0) {
      await supabase.from("resume_blocks").insert(
        resume.blocks.map((b) => ({ ...b, resume_id: newResume.id }))
      );
    }

    fetchResumes();
  }

  const firstName = userName.split(" ")[0];

  // Get accent color from resume data or fallback
  function getAccentColor(resume: ResumeWithBlocks): string {
    const data = resume.data as Record<string, unknown> | null;
    if (data?.designSettings) {
      const ds = data.designSettings as Record<string, unknown>;
      if (ds.accentColor) return ds.accentColor as string;
    }
    return "#1E3A5F";
  }

  return (
    <>
      {/* Greeting + New Resume button */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1
            className="text-[28px] font-bold text-primary"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Hello, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-tertiary">
            What&apos;s on your mind?
          </p>
        </div>
        <button
          onClick={createResume}
          disabled={creating}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white border-none cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          style={{ backgroundColor: "#059669" }}
        >
          <File06 className="size-4" />
          {creating ? "Creating..." : "New Resume"}
        </button>
      </div>

      {/* Action cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={createResume}
          disabled={creating}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-secondary bg-primary p-5 text-left transition-all cursor-pointer hover:border-[#8B5CF6]/30 hover:shadow-md"
        >
          <div className="relative z-10">
            <h3 className="text-base font-semibold text-primary mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Help me build my resume
            </h3>
            <p className="text-sm text-tertiary leading-relaxed">Start fresh or let AI guide your layout.</p>
          </div>
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="relative">
              <div className="w-12 h-16 rounded-md border-2 border-current bg-secondary rotate-3" />
              <div className="w-12 h-16 rounded-md border-2 border-current bg-primary absolute top-1 left-1 -rotate-2" />
              <div className="w-12 h-16 rounded-md border-2 border-current bg-primary absolute top-2 left-2 rotate-1" />
            </div>
          </div>
        </button>

        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-secondary bg-primary p-5 text-left transition-all hover:border-[#8B5CF6]/30 hover:shadow-md cursor-pointer">
          <div className="relative z-10">
            <h3 className="text-base font-semibold text-primary mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Help me craft a cover letter
            </h3>
            <p className="text-sm text-tertiary leading-relaxed">AI will generate a personalized cover letter instantly.</p>
          </div>
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="relative">
              <div className="w-12 h-16 rounded-md border-2 border-current bg-secondary rotate-6" />
              <div className="w-12 h-16 rounded-md border-2 border-current bg-primary absolute top-1 left-1 -rotate-1" />
            </div>
          </div>
        </div>

        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-secondary bg-primary p-5 text-left transition-all hover:border-[#8B5CF6]/30 hover:shadow-md cursor-pointer">
          <div className="relative z-10">
            <h3 className="text-base font-semibold text-primary mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Help me find the right job match
            </h3>
            <p className="text-sm text-tertiary leading-relaxed">See how well your resume fits a job description.</p>
          </div>
          <div className="absolute right-4 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe01 className="size-16" />
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex shrink-0 size-12 items-center justify-center rounded-xl bg-white/15">
              <Stars01 className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Have doubts? Start with our free trial now!
              </h3>
              <p className="text-sm text-white/75 max-w-xl">
                No payment today, and you can freely get all of our AI integration features for resume building, cover letters, and job matching.
              </p>
            </div>
          </div>
          <button className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#8B5CF6] shadow-sm transition cursor-pointer border-none hover:bg-white/90">
            Start Free Trial
          </button>
        </div>
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 size-24 rounded-full bg-white/5" />
      </div>

      {/* Recently Opened section */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-0">
          <button
            onClick={() => setActiveTab("recent")}
            className={cx(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0",
              activeTab === "recent" ? "border-[#8B5CF6] text-[#8B5CF6]" : "border-transparent text-tertiary hover:text-primary"
            )}
          >
            Recently Opened
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={cx(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0",
              activeTab === "shared" ? "border-[#8B5CF6] text-[#8B5CF6]" : "border-transparent text-tertiary hover:text-primary"
            )}
          >
            Shared files
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary px-3 py-1.5 text-sm text-tertiary cursor-pointer hover:bg-secondary transition-colors">
            All Files <ChevronDown className="size-3.5" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-secondary bg-primary px-3 py-1.5 text-sm text-tertiary cursor-pointer hover:bg-secondary transition-colors">
            Last viewed <ChevronDown className="size-3.5" />
          </button>
          <div className="flex items-center rounded-lg border border-secondary overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cx(
                "flex size-8 items-center justify-center cursor-pointer border-none transition-colors",
                viewMode === "grid" ? "bg-secondary text-primary" : "bg-primary text-quaternary hover:bg-secondary"
              )}
            >
              <Grid01 className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cx(
                "flex size-8 items-center justify-center cursor-pointer border-none transition-colors",
                viewMode === "list" ? "bg-secondary text-primary" : "bg-primary text-quaternary hover:bg-secondary"
              )}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Resume grid / list */}
      {loading ? (
        <div className="flex items-center gap-3 py-12 text-sm text-tertiary">
          <svg className="size-5 animate-spin" viewBox="0 0 20 20" fill="none">
            <circle className="stroke-current opacity-30" cx="10" cy="10" r="8" strokeWidth="2" />
            <circle className="origin-center animate-spin stroke-current" cx="10" cy="10" r="8" strokeWidth="2" strokeDasharray="12.5 50" strokeLinecap="round" />
          </svg>
          Loading resumes...
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary mb-4">
            <File06 className="size-8 text-fg-quaternary" />
          </div>
          <h2 className="text-lg font-semibold text-primary mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>No resumes yet</h2>
          <p className="text-sm text-tertiary mb-6 max-w-xs">
            Create your first resume and start building your professional story.
          </p>
          <Button color="primary" size="md" iconLeading={Plus} onClick={createResume} isLoading={creating}>
            Create Your First Resume
          </Button>
        </div>
      ) : (
        <div className={cx(
          viewMode === "grid"
            ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "flex flex-col gap-2"
        )}>
          {/* Resume cards */}
          {resumes.map((r) =>
            viewMode === "grid" ? (
              <div
                key={r.id}
                className="group relative flex flex-col rounded-xl border border-secondary bg-white shadow-xs transition hover:shadow-lg hover:border-[#8B5CF6]/25 cursor-pointer"
                onClick={() => window.location.href = `/editor/${r.id}`}
              >
                {/* A4 resume preview — full page scaled to fit card */}
                <div className="rounded-t-xl overflow-hidden">
                  <ScaledA4Preview>
                    <ResumeCardThumbnail blocks={r.blocks} accentColor={getAccentColor(r)} />
                  </ScaledA4Preview>
                </div>

                {/* Info bar */}
                <div className="px-3 py-2.5 flex items-center justify-between border-t border-gray-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-primary truncate">{r.title}</h3>
                      {r.is_base && <Star01 className="size-3.5 text-[#8B5CF6] shrink-0" />}
                    </div>
                    <span className="text-xs text-quaternary">Last edited {timeAgo(r.updated_at)}</span>
                  </div>

                  {/* 3-dot menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === r.id ? null : r.id);
                      }}
                      className="flex size-8 items-center justify-center rounded-md text-fg-quaternary hover:bg-secondary transition cursor-pointer border-none bg-transparent"
                    >
                      <DotsVertical className="size-4" />
                    </button>

                    {menuOpen === r.id && (
                      <div
                        className="absolute right-0 bottom-10 z-50 w-40 rounded-lg border border-secondary bg-primary shadow-lg py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { setMenuOpen(null); window.location.href = `/editor/${r.id}`; }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-secondary transition cursor-pointer border-none bg-transparent text-left"
                        >
                          <File06 className="size-3.5" /> Open
                        </button>
                        <button
                          onClick={() => { setMenuOpen(null); duplicateResume(r); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-secondary transition cursor-pointer border-none bg-transparent text-left"
                        >
                          <Copy01 className="size-3.5" /> Duplicate
                        </button>
                        <div className="my-1 border-t border-secondary" />
                        <button
                          onClick={() => { setMenuOpen(null); setDeleteTarget({ id: r.id, title: r.title }); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error-primary hover:bg-secondary transition cursor-pointer border-none bg-transparent text-left"
                        >
                          <Trash01 className="size-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* List view */
              <div
                key={r.id}
                className="group flex items-center gap-4 rounded-xl border border-secondary bg-primary p-3 transition hover:border-[#8B5CF6]/20 hover:shadow-sm cursor-pointer"
                onClick={() => window.location.href = `/editor/${r.id}`}
              >
                {/* Mini thumbnail */}
                <div className="shrink-0 rounded-lg bg-white border border-secondary overflow-hidden" style={{ width: 48, height: 68 }}>
                  <div style={{ width: A4_W, height: A4_H, transform: `scale(${48 / A4_W})`, transformOrigin: "top left" }}>
                    <ResumeCardThumbnail blocks={r.blocks} accentColor={getAccentColor(r)} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary truncate">{r.title}</h3>
                    {r.is_base && <Star01 className="size-3.5 text-[#8B5CF6] shrink-0" />}
                  </div>
                  <span className="text-xs text-quaternary">Last edited {timeAgo(r.updated_at)}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === r.id ? null : r.id);
                    }}
                    className="flex size-8 items-center justify-center rounded-md text-fg-quaternary hover:bg-secondary transition cursor-pointer border-none bg-transparent"
                  >
                    <DotsVertical className="size-4" />
                  </button>
                  {menuOpen === r.id && (
                    <div
                      className="absolute right-0 bottom-10 z-50 w-40 rounded-lg border border-secondary bg-primary shadow-lg py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { setMenuOpen(null); window.location.href = `/editor/${r.id}`; }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-secondary transition cursor-pointer border-none bg-transparent text-left"
                      >
                        <File06 className="size-3.5" /> Open
                      </button>
                      <button
                        onClick={() => { setMenuOpen(null); duplicateResume(r); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-secondary transition cursor-pointer border-none bg-transparent text-left"
                      >
                        <Copy01 className="size-3.5" /> Duplicate
                      </button>
                      <div className="my-1 border-t border-secondary" />
                      <button
                        onClick={() => { setMenuOpen(null); setDeleteTarget({ id: r.id, title: r.title }); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error-primary hover:bg-secondary transition cursor-pointer border-none bg-transparent text-left"
                      >
                        <Trash01 className="size-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-primary rounded-xl border border-secondary shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-primary mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Delete resume?
            </h3>
            <p className="text-sm text-tertiary mb-5">
              &ldquo;{deleteTarget.title}&rdquo; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-secondary bg-primary text-sm font-medium text-primary cursor-pointer hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg border-none bg-red-600 text-sm font-medium text-white cursor-pointer hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
