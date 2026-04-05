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
        const isFuture = step.id > currentStep && !completed;
        const isClickable = completed || isCurrent || step.id <= currentStep;
        const isLast = idx === WIZARD_STEPS.length - 1;

        return (
          <div key={step.id} className="flex gap-3">
            {/* Left column: circle + connector */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <button
                onClick={() => isClickable && setCurrentStep(step.id as StepId)}
                disabled={!isClickable}
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  backgroundColor: completed ? "#16A34A" : "#0A0A0A",
                  borderColor: completed ? "#16A34A" : isCurrent ? "#262626" : "transparent",
                  opacity: isFuture ? 0.6 : 1,
                  cursor: isClickable ? "pointer" : "default",
                }}
              >
                {completed ? (
                  <Check className="size-4 text-white" />
                ) : (
                  <span className="text-xs font-semibold text-white">{step.id}</span>
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{
                    backgroundColor: completed && isStepCompleted(WIZARD_STEPS[idx + 1]?.id as StepId)
                      ? "#16A34A"
                      : completed
                      ? "#16A34A"
                      : "transparent",
                    borderLeft: completed
                      ? "2px solid #16A34A"
                      : "2px dashed #404040",
                  }}
                />
              )}
            </div>

            {/* Right column: text */}
            <div
              className="pb-6"
              style={{ opacity: isFuture ? 0.6 : 1 }}
            >
              <button
                onClick={() => isClickable && setCurrentStep(step.id as StepId)}
                disabled={!isClickable}
                className="bg-transparent border-none p-0 text-left"
                style={{ cursor: isClickable ? "pointer" : "default" }}
              >
                <p
                  className="text-sm font-medium leading-tight"
                  style={{ color: isCurrent ? "#FFFFFF" : "#D4D4D4" }}
                >
                  {step.label}
                </p>
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: "#737373" }}
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
