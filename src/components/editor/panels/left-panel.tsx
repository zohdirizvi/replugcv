"use client";

import { Home03 } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";
import { ProgressStepper } from "../wizard/progress-stepper";
import { SettingsPanel } from "./settings-panel";
import { TemplatesPanel } from "./templates-panel";
import { useRouter } from "next/navigation";

export function LeftPanel() {
  const { activeTab, setActiveTab } = useEditorContext();
  const router = useRouter();

  const tabs = [
    { id: "builder" as const, label: "Builder" },
    { id: "templates" as const, label: "Templates" },
    { id: "settings" as const, label: "Settings" },
  ];

  return (
    <aside className="flex w-[304px] shrink-0 flex-col" style={{ backgroundColor: "#1F1C1C" }}>
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <span
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          ReplugCV
        </span>
      </div>

      {/* Tabs: Builder | Templates | Settings */}
      <div className="flex gap-0 border-b border-[#333] mx-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-3 pb-2.5 pt-1 text-sm font-medium bg-transparent border-none cursor-pointer transition-colors"
              style={{
                color: isActive ? "#16A34A" : "#A3A3A3",
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: "#16A34A" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "settings" ? (
        <SettingsPanel />
      ) : activeTab === "templates" ? (
        <TemplatesPanel />
      ) : (
        <ProgressStepper />
      )}

      {/* Back to Dashboard */}
      <div className="px-6 pb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors p-0"
          style={{ color: "#059669" }}
        >
          <Home03 className="size-4" />
          Back to Dashboard
        </button>
      </div>
    </aside>
  );
}
