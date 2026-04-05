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

        // Determine circle styles
        let circleBg: string;
        let circleBorder: string;
        if (isCurrent) {
          circleBg = "#16A34A";
          circleBorder = "#16A34A";
        } else if (completed) {
          circleBg = "#0A0A0A";
          circleBorder = "#404040";
        } else {
          circleBg = "#0A0A0A";
          circleBorder = "#262626";
        }

        // Connector line: green only between current and previous completed
        const nextStep = WIZARD_STEPS[idx + 1];
        const connectorSolid = completed && nextStep && (nextStep.id === currentStep || isStepCompleted(nextStep.id as StepId));

        return (
          <div key={step.id} className="flex gap-3">
            {/* Left column: circle + connector */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable && setCurrentStep(step.id as StepId)}
                disabled={!isClickable}
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  backgroundColor: circleBg,
                  borderColor: circleBorder,
                  opacity: isFuture ? 0.5 : 1,
                  cursor: isClickable ? "pointer" : "default",
                }}
              >
                {isCurrent ? (
                  /* Current step: green circle with step number */
                  <span className="text-xs font-semibold text-white">{step.id}</span>
                ) : completed ? (
                  /* Completed: subtle neutral check */
                  <Check className="size-4" style={{ color: "#737373" }} />
                ) : (
                  /* Future: neutral number */
                  <span className="text-xs font-semibold" style={{ color: "#737373" }}>{step.id}</span>
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{
                    borderLeft: connectorSolid
                      ? "2px solid #404040"
                      : "2px dashed #333",
                  }}
                />
              )}
            </div>

            {/* Right column: text */}
            <div
              className="pb-6"
              style={{ opacity: isFuture ? 0.5 : 1 }}
            >
              <button
                onClick={() => isClickable && setCurrentStep(step.id as StepId)}
                disabled={!isClickable}
                className="bg-transparent border-none p-0 text-left"
                style={{ cursor: isClickable ? "pointer" : "default" }}
              >
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ color: isCurrent ? "#D4D4D4" : "#A3A3A3" }}
                >
                  {step.label}
                </p>
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: isCurrent ? "#A3A3A3" : "#737373" }}
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
