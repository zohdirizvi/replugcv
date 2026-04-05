"use client";

import { Check } from "@untitledui/icons";
import { useEditorContext } from "../editor-context";
import { WIZARD_STEPS } from "../constants";
import type { StepId } from "../types";

export function ProgressStepper() {
  const { currentStep, setCurrentStep, isStepCompleted } = useEditorContext();

  return (
    <div className="flex flex-col px-6 py-4 flex-1 overflow-y-auto">
      {WIZARD_STEPS.map((step, idx) => {
        const completed = isStepCompleted(step.id);
        const isCurrent = currentStep === step.id;
        const isLast = idx === WIZARD_STEPS.length - 1;

        return (
          <div key={step.id} className="flex gap-4">
            {/* Left column: circle + connector */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(step.id as StepId)}
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors"
                style={{
                  backgroundColor: isCurrent ? "#16A34A" : "#0A0A0A",
                  borderColor: isCurrent ? "#16A34A" : "#333",
                  cursor: "pointer",
                }}
              >
                {isCurrent ? (
                  /* ONLY the current step gets a green check */
                  <Check className="size-4 text-white" />
                ) : completed ? (
                  /* Completed but not current: neutral check */
                  <Check className="size-4" style={{ color: "#737373" }} />
                ) : (
                  /* Not completed, not current: neutral number */
                  <span className="text-xs font-semibold" style={{ color: "#737373" }}>{step.id}</span>
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className="flex-1 min-h-[24px]"
                  style={{
                    width: 2,
                    backgroundColor: isCurrent || completed ? "#333" : "#262626",
                  }}
                />
              )}
            </div>

            {/* Right column: text */}
            <div className="pb-8 pt-1">
              <button
                onClick={() => setCurrentStep(step.id as StepId)}
                className="bg-transparent border-none p-0 text-left cursor-pointer"
              >
                <p
                  className="text-[15px] font-semibold leading-tight"
                  style={{ color: isCurrent ? "#D4D4D4" : "#737373" }}
                >
                  {step.label}
                </p>
                <p
                  className="text-xs mt-1 leading-snug"
                  style={{ color: isCurrent ? "#A3A3A3" : "#525252" }}
                >
                  {step.description}
                </p>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
