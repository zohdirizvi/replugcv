"use client";

import { useEditorContext } from "../editor-context";
import { StepPersonal } from "./step-personal";
import { StepSummary } from "./step-summary";
import { StepExperience } from "./step-experience";
import { StepEducation } from "./step-education";
import { StepSkills } from "./step-skills";
import { StepTemplates } from "./step-templates";

export function StepForm() {
  const { currentStep } = useEditorContext();

  switch (currentStep) {
    case 1:
      return <StepPersonal />;
    case 2:
      return <StepSummary />;
    case 3:
      return <StepExperience />;
    case 4:
      return <StepEducation />;
    case 5:
      return <StepSkills />;
    case 6:
      return <StepTemplates />;
    default:
      return <StepPersonal />;
  }
}
