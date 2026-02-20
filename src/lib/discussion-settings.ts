import { selectionCount, valuesList } from "@/src/config/values";
import { discussionSteps } from "@/src/config/discussion";

export type DiscussionSettings = {
  normsEnabled: boolean;
  inclusionEnabled: boolean;
  valuesCount: number;
  questionsCount: number;
};

const defaultQuestionsCount = 5;
const maxQuestionsCount = 20;

export const defaultDiscussionSettings: DiscussionSettings = {
  normsEnabled: true,
  inclusionEnabled: true,
  valuesCount: selectionCount,
  questionsCount: defaultQuestionsCount
};

export type DiscussionSettingsSource = {
  normsPartOf?: boolean | null;
  inclusionProblemPartOf?: boolean | null;
  valuesSelectionCount?: number | null;
  questionsPerParticipant?: number | null;
};

function normalizeNumber(value: number | null | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(Math.round(value), min), max);
}

export function normalizeDiscussionSettings(
  source?: DiscussionSettingsSource | null
): DiscussionSettings {
  return {
    normsEnabled: source?.normsPartOf ?? defaultDiscussionSettings.normsEnabled,
    inclusionEnabled:
      source?.inclusionProblemPartOf ?? defaultDiscussionSettings.inclusionEnabled,
    valuesCount: normalizeNumber(
      source?.valuesSelectionCount,
      defaultDiscussionSettings.valuesCount,
      1,
      valuesList.length
    ),
    questionsCount: normalizeNumber(
      source?.questionsPerParticipant,
      defaultDiscussionSettings.questionsCount,
      1,
      maxQuestionsCount
    )
  };
}

export function isStepEnabled(step: number, settings: DiscussionSettings) {
  if (step === 3) return settings.normsEnabled;
  if (step === 4) return settings.inclusionEnabled;
  return true;
}

export function getEnabledSteps(settings: DiscussionSettings) {
  return discussionSteps.map((item) => item.step).filter((step) => isStepEnabled(step, settings));
}

export function getDisplayStepNumber(actualStep: number, settings: DiscussionSettings) {
  const enabledSteps = getEnabledSteps(settings);
  const index = enabledSteps.indexOf(actualStep);
  return index >= 0 ? index + 1 : null;
}
