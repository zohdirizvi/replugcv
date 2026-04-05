"use client";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] bg-primary">
      {children}
    </div>
  );
}
