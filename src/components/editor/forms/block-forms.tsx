"use client";

import { Plus, Trash01 } from "@untitledui/icons";
import type { ResumeBlock } from "../types";
import { CONTACT_FIELDS_LIST } from "../constants";
import { FieldInput } from "./field-input";
import { FieldTextarea } from "./field-textarea";
import { BulletEditor } from "./bullet-editor";
import { TagsEditor } from "./tags-editor";

export function BlockForm({
  block,
  updateContent,
  updateTitle,
}: {
  block: ResumeBlock;
  updateContent: (id: string, content: Record<string, unknown>) => void;
  updateTitle: (id: string, title: string) => void;
}) {
  const c = block.content as Record<string, unknown>;

  const set = (key: string, value: unknown) => {
    updateContent(block.id, { ...c, [key]: value });
  };

  /* ---- Header ---- */
  if (block.type === "header") {
    return (
      <div className="flex flex-col gap-4">
        <FieldInput label="Full Name" value={(c.name as string) || ""} onChange={(v) => set("name", v)} />
        <FieldInput label="Job Title" value={(c.title as string) || ""} onChange={(v) => set("title", v)} />
        <FieldTextarea label="Professional Summary" value={(c.summary as string) || ""} onChange={(v) => set("summary", v)} rows={4} />
      </div>
    );
  }

  /* ---- Contact ---- */
  if (block.type === "contact") {
    return (
      <div className="flex flex-col gap-4">
        {CONTACT_FIELDS_LIST.map((f) => (
          <FieldInput key={f.key} label={f.label} value={(c[f.key] as string) || ""} onChange={(v) => set(f.key, v)} />
        ))}
      </div>
    );
  }

  /* ---- Summary ---- */
  if (block.type === "summary") {
    return (
      <div className="flex flex-col gap-4">
        <FieldTextarea label="Summary" value={(c.text as string) || ""} onChange={(v) => set("text", v)} rows={6} />
      </div>
    );
  }

  /* ---- Experience ---- */
  if (block.type === "experience") {
    const items = (c.items as Array<Record<string, unknown>>) || [];
    const updateItem = (idx: number, key: string, value: unknown) => {
      const next = items.map((item, i) => (i === idx ? { ...item, [key]: value } : item));
      set("items", next);
    };
    const addItem = () => {
      set("items", [...items, { company: "", role: "", startDate: "", endDate: "", description: "", bullets: [] }]);
    };
    const removeItem = (idx: number) => {
      set("items", items.filter((_, i) => i !== idx));
    };

    return (
      <div className="flex flex-col gap-5">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-3 rounded-lg border border-secondary p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-tertiary">Experience {idx + 1}</span>
              <button onClick={() => removeItem(idx)} className="flex size-6 items-center justify-center rounded bg-transparent border-none text-fg-quaternary cursor-pointer hover:text-error-primary">
                <Trash01 className="size-3.5" />
              </button>
            </div>
            <FieldInput label="Job Title" value={(item.role as string) || ""} onChange={(v) => updateItem(idx, "role", v)} />
            <FieldInput label="Employer" value={(item.company as string) || ""} onChange={(v) => updateItem(idx, "company", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Start Date" value={(item.startDate as string) || ""} onChange={(v) => updateItem(idx, "startDate", v)} placeholder="e.g. Jan 2022" />
              <FieldInput label="End Date" value={(item.endDate as string) || ""} onChange={(v) => updateItem(idx, "endDate", v)} placeholder="e.g. Present" />
            </div>
            <FieldTextarea label="Description" value={(item.description as string) || ""} onChange={(v) => updateItem(idx, "description", v)} rows={3} />
            <BulletEditor
              bullets={(item.bullets as string[]) || []}
              onChange={(bullets) => updateItem(idx, "bullets", bullets)}
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-secondary py-2 text-sm font-medium text-tertiary bg-transparent cursor-pointer transition-colors hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] justify-center"
        >
          <Plus className="size-4" /> Add One More
        </button>
      </div>
    );
  }

  /* ---- Education ---- */
  if (block.type === "education") {
    const items = (c.items as Array<Record<string, unknown>>) || [];
    const updateItem = (idx: number, key: string, value: unknown) => {
      const next = items.map((item, i) => (i === idx ? { ...item, [key]: value } : item));
      set("items", next);
    };
    const addItem = () => {
      set("items", [...items, { school: "", degree: "", field: "", startYear: "", endYear: "", gpa: "" }]);
    };
    const removeItem = (idx: number) => {
      set("items", items.filter((_, i) => i !== idx));
    };

    return (
      <div className="flex flex-col gap-5">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-3 rounded-lg border border-secondary p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-tertiary">Education {idx + 1}</span>
              <button onClick={() => removeItem(idx)} className="flex size-6 items-center justify-center rounded bg-transparent border-none text-fg-quaternary cursor-pointer hover:text-error-primary">
                <Trash01 className="size-3.5" />
              </button>
            </div>
            <FieldInput label="School" value={(item.school as string) || ""} onChange={(v) => updateItem(idx, "school", v)} />
            <FieldInput label="Degree" value={(item.degree as string) || ""} onChange={(v) => updateItem(idx, "degree", v)} />
            <FieldInput label="Field of Study" value={(item.field as string) || ""} onChange={(v) => updateItem(idx, "field", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Start Year" value={(item.startYear as string) || ""} onChange={(v) => updateItem(idx, "startYear", v)} />
              <FieldInput label="End Year" value={(item.endYear as string) || ""} onChange={(v) => updateItem(idx, "endYear", v)} />
            </div>
            <FieldInput label="GPA (optional)" value={(item.gpa as string) || ""} onChange={(v) => updateItem(idx, "gpa", v)} />
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-secondary py-2 text-sm font-medium text-tertiary bg-transparent cursor-pointer transition-colors hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] justify-center"
        >
          <Plus className="size-4" /> Add One More
        </button>
      </div>
    );
  }

  /* ---- Skills / Languages / Interests ---- */
  if (block.type === "skills" || block.type === "languages" || block.type === "interests") {
    const items = (c.items as string[]) || [];
    return <TagsEditor items={items} onChange={(v) => set("items", v)} label={block.title} />;
  }

  /* ---- Projects ---- */
  if (block.type === "projects") {
    const items = (c.items as Array<Record<string, unknown>>) || [];
    const updateItem = (idx: number, key: string, value: unknown) => {
      const next = items.map((item, i) => (i === idx ? { ...item, [key]: value } : item));
      set("items", next);
    };
    const addItem = () => {
      set("items", [...items, { name: "", description: "", url: "" }]);
    };
    const removeItem = (idx: number) => {
      set("items", items.filter((_, i) => i !== idx));
    };

    return (
      <div className="flex flex-col gap-5">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-3 rounded-lg border border-secondary p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-tertiary">Project {idx + 1}</span>
              <button onClick={() => removeItem(idx)} className="flex size-6 items-center justify-center rounded bg-transparent border-none text-fg-quaternary cursor-pointer hover:text-error-primary">
                <Trash01 className="size-3.5" />
              </button>
            </div>
            <FieldInput label="Project Name" value={(item.name as string) || ""} onChange={(v) => updateItem(idx, "name", v)} />
            <FieldTextarea label="Description" value={(item.description as string) || ""} onChange={(v) => updateItem(idx, "description", v)} rows={3} />
            <FieldInput label="URL (optional)" value={(item.url as string) || ""} onChange={(v) => updateItem(idx, "url", v)} />
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-secondary py-2 text-sm font-medium text-tertiary bg-transparent cursor-pointer transition-colors hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] justify-center"
        >
          <Plus className="size-4" /> Add One More
        </button>
      </div>
    );
  }

  /* ---- Generic items (certifications, awards, volunteer, publications) ---- */
  if (["certifications", "awards", "volunteer", "publications"].includes(block.type)) {
    const items = (c.items as Array<Record<string, unknown>>) || [];
    const updateItem = (idx: number, key: string, value: unknown) => {
      const next = items.map((item, i) => (i === idx ? { ...item, [key]: value } : item));
      set("items", next);
    };
    const addItem = () => {
      set("items", [...items, { title: "", description: "", date: "" }]);
    };
    const removeItem = (idx: number) => {
      set("items", items.filter((_, i) => i !== idx));
    };

    return (
      <div className="flex flex-col gap-5">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-3 rounded-lg border border-secondary p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-tertiary">{block.title} {idx + 1}</span>
              <button onClick={() => removeItem(idx)} className="flex size-6 items-center justify-center rounded bg-transparent border-none text-fg-quaternary cursor-pointer hover:text-error-primary">
                <Trash01 className="size-3.5" />
              </button>
            </div>
            <FieldInput label="Title" value={(item.title as string) || ""} onChange={(v) => updateItem(idx, "title", v)} />
            <FieldTextarea label="Description" value={(item.description as string) || ""} onChange={(v) => updateItem(idx, "description", v)} rows={2} />
            <FieldInput label="Date" value={(item.date as string) || ""} onChange={(v) => updateItem(idx, "date", v)} />
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-secondary py-2 text-sm font-medium text-tertiary bg-transparent cursor-pointer transition-colors hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] justify-center"
        >
          <Plus className="size-4" /> Add {block.title}
        </button>
      </div>
    );
  }

  /* ---- Custom / fallback ---- */
  return (
    <div className="flex flex-col gap-4">
      <FieldInput label="Section Title" value={block.title} onChange={(v) => updateTitle(block.id, v)} />
      <FieldTextarea label="Content" value={(c.text as string) || ""} onChange={(v) => set("text", v)} rows={6} />
    </div>
  );
}
