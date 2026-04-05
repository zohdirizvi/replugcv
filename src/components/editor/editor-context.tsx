"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Resume, ResumeBlock, SaveStatus, TemplateId, StepId, ResumeDesignSettings } from "./types";
import { DEFAULT_DESIGN_SETTINGS } from "./types";
import { BLOCK_META, DEFAULT_CONTENT, TEMPLATES, WIZARD_STEPS } from "./constants";

const MAX_HISTORY = 50;

type HistoryEntry = {
  blocks: ResumeBlock[];
  resume: Resume | null;
};

type EditorContextValue = {
  resume: Resume | null;
  blocks: ResumeBlock[];
  selectedBlockId: string | null;
  expandedBlockId: string | null;
  saveStatus: SaveStatus;
  zoom: number;
  activeTab: "builder" | "templates" | "settings";
  templateId: TemplateId;
  loading: boolean;
  userPlan: string;
  designSettings: ResumeDesignSettings;

  /* wizard */
  currentStep: StepId;
  setCurrentStep: (step: StepId) => void;
  goNextStep: () => void;
  goPrevStep: () => void;
  isStepCompleted: (step: StepId) => boolean;

  /* title editing */
  editingTitle: boolean;
  titleDraft: string;
  setEditingTitle: (v: boolean) => void;
  setTitleDraft: (v: string) => void;
  saveTitle: () => void;

  /* undo/redo */
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  /* actions */
  updateBlockContent: (blockId: string, content: Record<string, unknown>) => void;
  updateBlockField: (blockId: string, fieldPath: string, value: unknown) => void;
  updateBlockTitle: (blockId: string, title: string) => void;
  addBlock: (type: string) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  reorderBlocks: (fromIdx: number, toIdx: number) => void;
  setSelectedBlockId: (id: string | null) => void;
  setExpandedBlockId: (id: string | null) => void;
  setZoom: (z: number) => void;
  setActiveTab: (t: "builder" | "templates" | "settings") => void;
  setTemplateId: (id: TemplateId) => void;
  scrollToBlock: (blockId: string) => void;
  updateDesignSettings: (partial: Partial<ResumeDesignSettings>) => void;
  toggleBlockVisibility: (blockId: string) => void;

  /* helpers */
  getBlockByType: (type: string) => ResumeBlock | undefined;
  ensureBlock: (type: string) => Promise<ResumeBlock>;

  /* drag */
  dragIdx: number | null;
  dragOverIdx: number | null;
  setDragIdx: (i: number | null) => void;
  setDragOverIdx: (i: number | null) => void;
  handleDragEnd: () => void;

  /* refs */
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorContext must be used within EditorProvider");
  return ctx;
}

export function EditorProvider({
  resumeId,
  children,
}: {
  resumeId: string;
  children: React.ReactNode;
}) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [blocks, setBlocks] = useState<ResumeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [zoom, setZoom] = useState(1.0);
  const [activeTab, setActiveTab] = useState<"builder" | "templates" | "settings">("builder");
  const [templateId, setTemplateId] = useState<TemplateId>("modern-clean");
  const [userPlan, setUserPlan] = useState<string>("free");
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [designSettings, setDesignSettings] = useState<ResumeDesignSettings>(DEFAULT_DESIGN_SETTINGS);

  /* undo/redo */
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const designSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* drag */
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  /* --- History helpers --- */
  const pushUndo = useCallback((entry: HistoryEntry) => {
    undoStackRef.current = [...undoStackRef.current.slice(-(MAX_HISTORY - 1)), entry];
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const prev = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    // push current state to redo
    setBlocks((curBlocks) => {
      setResume((curResume) => {
        redoStackRef.current = [...redoStackRef.current, { blocks: curBlocks, resume: curResume }];
        setCanRedo(true);
        return prev.resume;
      });
      return prev.blocks;
    });
    setCanUndo(undoStackRef.current.length > 0);
    // save restored state
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const promises: PromiseLike<unknown>[] = [];
        for (const block of prev.blocks) {
          promises.push(
            supabase
              .from("resume_blocks")
              .update({
                content: block.content,
                title: block.title,
                is_visible: block.is_visible,
                sort_order: block.sort_order,
              })
              .eq("id", block.id)
              .then()
          );
        }
        await Promise.all(promises);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 400);
  }, []);

  const redo = useCallback(() => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;
    const next = stack[stack.length - 1];
    redoStackRef.current = stack.slice(0, -1);
    setBlocks((curBlocks) => {
      setResume((curResume) => {
        undoStackRef.current = [...undoStackRef.current, { blocks: curBlocks, resume: curResume }];
        setCanUndo(true);
        return next.resume;
      });
      return next.blocks;
    });
    setCanRedo(redoStackRef.current.length > 0);
    // save restored state
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const promises: PromiseLike<unknown>[] = [];
        for (const block of next.blocks) {
          promises.push(
            supabase
              .from("resume_blocks")
              .update({
                content: block.content,
                title: block.title,
                is_visible: block.is_visible,
                sort_order: block.sort_order,
              })
              .eq("id", block.id)
              .then()
          );
        }
        await Promise.all(promises);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 400);
  }, []);

  /* --- Keyboard shortcuts for undo/redo --- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (mod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl+Y for redo (Windows convention)
      if (mod && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async () => {
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase.from("resumes").select("id, title, status, data").eq("id", resumeId).single(),
      supabase.from("resume_blocks").select("*").eq("resume_id", resumeId).order("sort_order"),
    ]);
    if (r) {
      setResume(r);
      setTitleDraft(r.title);
      // Load design settings from resume.data
      if (r.data && typeof r.data === "object") {
        const d = r.data as Record<string, unknown>;
        if (d.designSettings) {
          setDesignSettings({ ...DEFAULT_DESIGN_SETTINGS, ...(d.designSettings as Partial<ResumeDesignSettings>) });
        }
      }
    }
    if (b) {
      setBlocks(b);
      if (b.length > 0) {
        setSelectedBlockId(b[0].id);
        setExpandedBlockId(b[0].id);
      }
    }
    // Fetch user plan from profiles
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      if (profile?.plan) setUserPlan(profile.plan);
    }
    setLoading(false);
  }, [resumeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------- Auto-save ---------- */
  const scheduleSave = useCallback(
    (updatedBlocks: ResumeBlock[], updatedResume?: Resume) => {
      setSaveStatus("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          const promises: PromiseLike<unknown>[] = [];
          for (const block of updatedBlocks) {
            promises.push(
              supabase
                .from("resume_blocks")
                .update({
                  content: block.content,
                  title: block.title,
                  is_visible: block.is_visible,
                  sort_order: block.sort_order,
                })
                .eq("id", block.id)
                .then()
            );
          }
          if (updatedResume) {
            promises.push(
              supabase
                .from("resumes")
                .update({ title: updatedResume.title })
                .eq("id", updatedResume.id)
                .then()
            );
          }
          await Promise.all(promises);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 800);
    },
    []
  );

  /* ---------- Save design settings to Supabase ---------- */
  const saveDesignSettings = useCallback(
    (settings: ResumeDesignSettings) => {
      if (!resume) return;
      setSaveStatus("saving");
      if (designSaveTimerRef.current) clearTimeout(designSaveTimerRef.current);
      designSaveTimerRef.current = setTimeout(async () => {
        try {
          const existingData = (resume.data && typeof resume.data === "object" ? resume.data : {}) as Record<string, unknown>;
          const newData = { ...existingData, designSettings: settings };
          await supabase
            .from("resumes")
            .update({ data: newData })
            .eq("id", resume.id);
          setResume((prev) => prev ? { ...prev, data: newData } : prev);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 500);
    },
    [resume]
  );

  const updateDesignSettings = useCallback(
    (partial: Partial<ResumeDesignSettings>) => {
      setDesignSettings((prev) => {
        const next = { ...prev, ...partial };
        saveDesignSettings(next);
        return next;
      });
    },
    [saveDesignSettings]
  );

  /* ---------- Block updates ---------- */
  const updateBlockContent = useCallback(
    (blockId: string, content: Record<string, unknown>) => {
      setBlocks((prev) => {
        pushUndo({ blocks: prev, resume });
        const next = prev.map((b) => (b.id === blockId ? { ...b, content } : b));
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave, pushUndo, resume]
  );

  const updateBlockField = useCallback(
    (blockId: string, fieldPath: string, value: unknown) => {
      setBlocks((prev) => {
        pushUndo({ blocks: prev, resume });
        const next = prev.map((b) => {
          if (b.id !== blockId) return b;
          const content = { ...b.content } as Record<string, unknown>;
          const parts = fieldPath.split(".");
          if (parts.length === 1) {
            content[parts[0]] = value;
          } else if (parts.length === 2) {
            const arr = [...((content[parts[0]] as unknown[]) || [])];
            arr[Number(parts[1])] = value;
            content[parts[0]] = arr;
          } else if (parts.length === 3) {
            const arr = [...((content[parts[0]] as Array<Record<string, unknown>>) || [])];
            arr[Number(parts[1])] = { ...arr[Number(parts[1])], [parts[2]]: value };
            content[parts[0]] = arr;
          }
          return { ...b, content };
        });
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave, pushUndo, resume]
  );

  const updateBlockTitle = useCallback(
    (blockId: string, title: string) => {
      setBlocks((prev) => {
        const next = prev.map((b) => (b.id === blockId ? { ...b, title } : b));
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  /* ---------- Resume title ---------- */
  const saveTitle = useCallback(() => {
    if (!resume) return;
    const updated = { ...resume, title: titleDraft };
    setResume(updated);
    setEditingTitle(false);
    scheduleSave(blocks, updated);
  }, [resume, titleDraft, blocks, scheduleSave]);

  /* ---------- Add block ---------- */
  const addBlock = useCallback(
    async (type: string) => {
      pushUndo({ blocks, resume });
      const maxOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.sort_order)) : -1;
      const defaultContent = DEFAULT_CONTENT[type] || {};

      const label = BLOCK_META[type]?.label || type;
      const { data, error } = await supabase
        .from("resume_blocks")
        .insert({
          resume_id: resumeId,
          type,
          title: label,
          sort_order: maxOrder + 1,
          content: defaultContent,
        })
        .select("*")
        .single();

      if (data && !error) {
        setBlocks((prev) => [...prev, data]);
        setSelectedBlockId(data.id);
        setExpandedBlockId(data.id);
      }
    },
    [blocks, resumeId, pushUndo, resume]
  );

  /* ---------- Delete block ---------- */
  const deleteBlock = useCallback(
    async (blockId: string) => {
      pushUndo({ blocks, resume });
      await supabase.from("resume_blocks").delete().eq("id", blockId);
      setBlocks((prev) => {
        const next = prev.filter((b) => b.id !== blockId);
        if (selectedBlockId === blockId) {
          setSelectedBlockId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [selectedBlockId, pushUndo, blocks, resume]
  );

  /* ---------- Reorder (drag-and-drop) ---------- */
  const reorderBlocks = useCallback(
    (fromIdx: number, toIdx: number) => {
      setBlocks((prev) => {
        pushUndo({ blocks: prev, resume });
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        const reordered = next.map((b, i) => ({ ...b, sort_order: i }));
        scheduleSave(reordered);
        return reordered;
      });
    },
    [scheduleSave, pushUndo, resume]
  );

  /* ---------- Toggle block visibility ---------- */
  const toggleBlockVisibility = useCallback(
    (blockId: string) => {
      setBlocks((prev) => {
        pushUndo({ blocks: prev, resume });
        const next = prev.map((b) =>
          b.id === blockId ? { ...b, is_visible: b.is_visible === false ? true : false } : b
        );
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave, pushUndo, resume]
  );

  const handleDragEnd = useCallback(() => {
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    reorderBlocks(dragIdx, dragOverIdx);
    setDragIdx(null);
    setDragOverIdx(null);
  }, [dragIdx, dragOverIdx, reorderBlocks]);

  /* ---------- Scroll to block ---------- */
  const scrollToBlock = useCallback(
    (blockId: string) => {
      setSelectedBlockId(blockId);
      setExpandedBlockId(blockId);
      blockRefs.current[blockId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    []
  );

  /* ---------- Wizard helpers ---------- */
  const getBlockByType = useCallback(
    (type: string) => blocks.find((b) => b.type === type),
    [blocks]
  );

  const ensureBlock = useCallback(
    async (type: string): Promise<ResumeBlock> => {
      const existing = blocks.find((b) => b.type === type);
      if (existing) return existing;
      await addBlock(type);
      return new Promise((resolve) => {
        setBlocks((prev) => {
          const found = prev.find((b) => b.type === type);
          if (found) resolve(found);
          return prev;
        });
      });
    },
    [blocks, addBlock]
  );

  const isStepCompleted = useCallback(
    (step: StepId): boolean => {
      const wizardStep = WIZARD_STEPS.find((s) => s.id === step);
      if (!wizardStep) return false;
      if (wizardStep.blockTypes.length === 0) return false;
      return wizardStep.blockTypes.every((type) => {
        const block = blocks.find((b) => b.type === type);
        if (!block) return false;
        const c = block.content as Record<string, unknown>;
        if (type === "header") return !!((c.name as string));
        if (type === "contact") return !!((c.email as string));
        if (type === "summary") return !!((c.text as string));
        if (type === "experience" || type === "education") {
          const items = (c.items as unknown[]) || [];
          return items.length > 0;
        }
        if (type === "skills") {
          const items = (c.items as unknown[]) || [];
          return items.length > 0;
        }
        return false;
      });
    },
    [blocks]
  );

  const goNextStep = useCallback(() => {
    if (currentStep < 6) setCurrentStep((currentStep + 1) as StepId);
  }, [currentStep]);

  const goPrevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as StepId);
  }, [currentStep]);

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  const value: EditorContextValue = {
    resume,
    blocks,
    selectedBlockId,
    expandedBlockId,
    saveStatus,
    zoom,
    activeTab,
    templateId,
    loading,
    editingTitle,
    titleDraft,
    setEditingTitle,
    setTitleDraft,
    saveTitle,
    designSettings,
    updateDesignSettings,
    toggleBlockVisibility,
    undo,
    redo,
    canUndo,
    canRedo,
    updateBlockContent,
    updateBlockField,
    updateBlockTitle,
    addBlock,
    deleteBlock,
    reorderBlocks,
    setSelectedBlockId,
    setExpandedBlockId,
    setZoom,
    setActiveTab,
    setTemplateId,
    scrollToBlock,
    dragIdx,
    dragOverIdx,
    setDragIdx,
    setDragOverIdx,
    handleDragEnd,
    userPlan,
    blockRefs,
    currentStep,
    setCurrentStep,
    goNextStep,
    goPrevStep,
    isStepCompleted,
    getBlockByType,
    ensureBlock,
  };

  // Suppress unused variable warning
  void template;

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
