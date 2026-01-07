import type { DiscussionStep } from "@/src/types/discussion";

export const discussionSteps: DiscussionStep[] = [
  {
    step: 1,
    title: "Werte bestimmen",
    prompt:
      "Waehle die Werte aus, die fuer dich in dieser Diskussion zentral sind.",
    helper: "Material: \"Welche Werte habe ich?\""
  },
  {
    step: 2,
    title: "Normen bestimmen",
    prompt:
      "Welche Normen lassen sich aus deinen Werten ableiten? Beziehe dich auf Handlung und Gerechtigkeit."
  },
  {
    step: 3,
    title: "Inklusionsproblem",
    prompt:
      "Wer oder was muss geschuetzt werden? Begruende den Rahmen anhand der Normen."
  },
  {
    step: 4,
    title: "Moegliche Umsetzung",
    prompt:
      "Wie kann die Diskussion praktisch umgesetzt werden? Skizziere Kompromisse oder Massnahmen."
  },
  {
    step: 5,
    title: "Feedback",
    prompt:
      "Bist du zufrieden mit dem Ergebnis? Was kann besser gemacht werden?"
  }
];
