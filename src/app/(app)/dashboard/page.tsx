"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "@untitledui/icons";
import { cx } from "@/utils/cx";

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
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [userName, setUserName] = useState("User");
  const [activeTab, setActiveTab] = useState<"recent" | "shared">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchResumes = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUserName(session.user.user_metadata?.full_name || "User");

    const { data } = await supabase
      .from("resumes")
      .select("id, title, status, is_base, parent_id, job_title, job_company, ats_score, updated_at, created_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    setResumes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

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
      { resume_id: data.id, type: "experience", title: "Experience", sort_order: 2, content: { items: [] } },
      { resume_id: data.id, type: "education", title: "Education", sort_order: 3, content: { items: [] } },
      { resume_id: data.id, type: "skills", title: "Skills", sort_order: 4, content: { items: [] } },
    ];

    await supabase.from("resume_blocks").insert(defaultBlocks);
    setCreating(false);

    window.location.href = `/editor/${data.id}`;
  }

  async function deleteResume(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from("resumes").delete().eq("id", id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  async function duplicateResume(resume: Resume) {
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

    const { data: blocks } = await supabase
      .from("resume_blocks")
      .select("type, title, sort_order, content, is_visible")
      .eq("resume_id", resume.id);

    if (blocks && blocks.length > 0) {
      await supabase.from("resume_blocks").insert(
        blocks.map((b) => ({ ...b, resume_id: newResume.id }))
      );
    }

    fetchResumes();
  }

  function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  const firstName = userName.split(" ")[0];

  return (
    <>
      {/* Greeting */}
      <div className="mb-8">
        <h1
          className="text-[28px] font-bold text-primary"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {getGreeting()}, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-tertiary">
          A new day, a new opportunity! Let&apos;s create something amazing together.
        </p>
      </div>

      {/* Action cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Build Resume */}
        <button
          onClick={createResume}
          disabled={creating}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-secondary bg-primary p-5 text-left transition-all cursor-pointer hover:border-[#8B5CF6]/30 hover:shadow-md"
        >
          <div className="relative z-10">
            <h3
              className="text-base font-semibold text-primary mb-1"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Help me build my resume
            </h3>
            <p className="text-sm text-tertiary leading-relaxed">
              Start fresh or let AI guide your layout.
            </p>
          </div>
          {/* Decorative docs */}
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="relative">
              <div className="w-12 h-16 rounded-md border-2 border-current bg-secondary rotate-3" />
              <div className="w-12 h-16 rounded-md border-2 border-current bg-primary absolute top-1 left-1 -rotate-2" />
              <div className="w-12 h-16 rounded-md border-2 border-current bg-primary absolute top-2 left-2 rotate-1" />
            </div>
          </div>
        </button>

        {/* Card 2: Cover Letter */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-secondary bg-primary p-5 text-left transition-all hover:border-[#8B5CF6]/30 hover:shadow-md cursor-pointer">
          <div className="relative z-10">
            <h3
              className="text-base font-semibold text-primary mb-1"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Help me craft a cover letter
            </h3>
            <p className="text-sm text-tertiary leading-relaxed">
              AI will generate a personalized cover letter instantly.
            </p>
          </div>
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="relative">
              <div className="w-12 h-16 rounded-md border-2 border-current bg-secondary rotate-6" />
              <div className="w-12 h-16 rounded-md border-2 border-current bg-primary absolute top-1 left-1 -rotate-1" />
            </div>
          </div>
        </div>

        {/* Card 3: Job Match */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-secondary bg-primary p-5 text-left transition-all hover:border-[#8B5CF6]/30 hover:shadow-md cursor-pointer">
          <div className="relative z-10">
            <h3
              className="text-base font-semibold text-primary mb-1"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Help me find the right job match
            </h3>
            <p className="text-sm text-tertiary leading-relaxed">
              See how well your resume fits a job description.
            </p>
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
            {/* Decorative sparkle */}
            <div className="hidden sm:flex shrink-0 size-12 items-center justify-center rounded-xl bg-white/15">
              <Stars01 className="size-6 text-white" />
            </div>
            <div>
              <h3
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
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
        {/* Background decorative circles */}
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
              activeTab === "recent"
                ? "border-[#8B5CF6] text-[#8B5CF6]"
                : "border-transparent text-tertiary hover:text-primary"
            )}
          >
            Recently Opened
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={cx(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0",
              activeTab === "shared"
                ? "border-[#8B5CF6] text-[#8B5CF6]"
                : "border-transparent text-tertiary hover:text-primary"
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

      {/* Resume grid */}
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
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "flex flex-col gap-2"
        )}>
          {/* Create new card */}
          {viewMode === "grid" && (
            <button
              onClick={createResume}
              disabled={creating}
              className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-secondary bg-transparent cursor-pointer transition hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/4"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary group-hover:bg-[#8B5CF6]/10 transition">
                <Plus className="size-6 text-fg-quaternary group-hover:text-[#8B5CF6] transition" />
              </div>
              <span className="text-sm font-medium text-tertiary group-hover:text-[#8B5CF6] transition">
                {creating ? "Creating..." : "Create New Resume"}
              </span>
            </button>
          )}

          {/* Resume cards */}
          {resumes.map((r) =>
            viewMode === "grid" ? (
              <div
                key={r.id}
                className="group relative flex min-h-[220px] flex-col rounded-xl border border-secondary bg-primary shadow-xs transition hover:border-[#8B5CF6]/20 hover:shadow-md cursor-pointer"
                onClick={() => window.location.href = `/editor/${r.id}`}
              >
                {/* Thumbnail placeholder */}
                <div className="flex-1 rounded-t-xl bg-secondary flex items-center justify-center p-6">
                  <div className="w-full max-w-[120px] space-y-2">
                    <div className="h-2 w-3/4 rounded bg-tertiary/30" />
                    <div className="h-1.5 w-full rounded bg-tertiary/20" />
                    <div className="h-1.5 w-5/6 rounded bg-tertiary/20" />
                    <div className="h-1.5 w-full rounded bg-tertiary/20" />
                    <div className="h-1.5 w-2/3 rounded bg-tertiary/20" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-primary truncate flex-1">{r.title}</h3>
                    {r.is_base && <Star01 className="size-4 text-[#8B5CF6] shrink-0" />}
                  </div>
                  <span className="text-xs text-quaternary">Last edited {timeAgo(r.updated_at)}</span>
                </div>

                {/* Actions (show on hover) */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateResume(r); }}
                    className="flex size-8 items-center justify-center rounded-md bg-primary/90 text-fg-quaternary shadow-xs hover:text-fg-quaternary_hover transition cursor-pointer border-none backdrop-blur-sm"
                    title="Duplicate"
                  >
                    <Copy01 className="size-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteResume(r.id, r.title); }}
                    className="flex size-8 items-center justify-center rounded-md bg-primary/90 text-fg-quaternary shadow-xs hover:text-error-primary transition cursor-pointer border-none backdrop-blur-sm"
                    title="Delete"
                  >
                    <Trash01 className="size-4" />
                  </button>
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
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <div className="w-6 space-y-1">
                    <div className="h-0.5 w-full rounded bg-tertiary/30" />
                    <div className="h-0.5 w-3/4 rounded bg-tertiary/20" />
                    <div className="h-0.5 w-full rounded bg-tertiary/20" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary truncate">{r.title}</h3>
                    {r.is_base && <Star01 className="size-3.5 text-[#8B5CF6] shrink-0" />}
                  </div>
                  <span className="text-xs text-quaternary">Last edited {timeAgo(r.updated_at)}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateResume(r); }}
                    className="flex size-8 items-center justify-center rounded-md text-fg-quaternary hover:text-fg-quaternary_hover transition cursor-pointer border-none bg-transparent hover:bg-secondary"
                    title="Duplicate"
                  >
                    <Copy01 className="size-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteResume(r.id, r.title); }}
                    className="flex size-8 items-center justify-center rounded-md text-fg-quaternary hover:text-error-primary transition cursor-pointer border-none bg-transparent hover:bg-secondary"
                    title="Delete"
                  >
                    <Trash01 className="size-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
}
