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
      "Welche Normen lassen sich aus deinen Werten ableiten?"
  },
  {
    step: 3,
    title: "Inklusionsproblem",
    prompt:
      "Wer oder was muss geschuetzt werden? Begruende den Rahmen anhand der Normen."
  },
  {
    step: 4,
    title: "Diskussion",
    prompt:
      "Was ist Dir wichtig? Formuliere Fragen, die du gerne diskutieren moechtest."
  },
  {
    step: 5,
    title: "Fazit",
    prompt:
      "Formuliere dein Fazit zur Diskussion."
  }
];
