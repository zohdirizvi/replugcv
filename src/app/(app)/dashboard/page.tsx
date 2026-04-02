"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Plus, Trash01, File06, Copy01, Star01 } from "@untitledui/icons";
// cx removed — not needed on this page

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

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchResumes = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

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

    // Create default blocks
    const defaultBlocks = [
      { resume_id: data.id, type: "header", title: "Header", sort_order: 0, content: { name: "", title: "", summary: "" } },
      { resume_id: data.id, type: "contact", title: "Contact", sort_order: 1, content: { email: "", phone: "", location: "", website: "", linkedin: "" } },
      { resume_id: data.id, type: "experience", title: "Experience", sort_order: 2, content: { items: [] } },
      { resume_id: data.id, type: "education", title: "Education", sort_order: 3, content: { items: [] } },
      { resume_id: data.id, type: "skills", title: "Skills", sort_order: 4, content: { items: [] } },
    ];

    await supabase.from("resume_blocks").insert(defaultBlocks);
    setCreating(false);

    // Navigate to editor
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

    // Create copy
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

    // Copy blocks
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

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-display-xs font-semibold text-primary" style={{ fontFamily: "'Manrope', sans-serif" }}>My Resumes</h1>
          <p className="mt-1 text-sm text-tertiary">Create, manage, and tailor your resumes for every opportunity.</p>
        </div>
        <Button color="primary" size="sm" iconLeading={Plus} onClick={createResume} isLoading={creating}>
          New Resume
        </Button>
      </div>

      {/* Grid */}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Create new card */}
          <button
            onClick={createResume}
            disabled={creating}
            className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-secondary bg-transparent cursor-pointer transition hover:border-brand-solid hover:bg-primary_hover"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary group-hover:bg-brand-primary transition">
              <Plus className="size-6 text-fg-quaternary group-hover:text-brand-secondary transition" />
            </div>
            <span className="text-sm font-medium text-tertiary group-hover:text-brand-secondary transition">
              {creating ? "Creating..." : "Create New Resume"}
            </span>
          </button>

          {/* Resume cards */}
          {resumes.map((r) => (
            <div
              key={r.id}
              className="group relative flex min-h-[220px] flex-col rounded-xl border border-secondary bg-primary shadow-xs transition hover:border-brand-solid/20 hover:shadow-md cursor-pointer"
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
                  {r.is_base && <Star01 className="size-4 text-brand-secondary shrink-0" />}
                </div>
                <div className="flex items-center gap-2">
                  <Badge type="pill-color" size="sm" color={r.status === "completed" ? "success" : "gray"}>
                    {r.status}
                  </Badge>
                  <span className="text-xs text-quaternary">{timeAgo(r.updated_at)}</span>
                </div>
                {r.job_company && (
                  <div className="mt-1 text-xs text-tertiary truncate">
                    {r.job_title ? `${r.job_title} at ${r.job_company}` : r.job_company}
                  </div>
                )}
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
          ))}
        </div>
      )}
    </>
  );
}
