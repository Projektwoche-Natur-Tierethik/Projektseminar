import type { DiscussionStep } from "@/src/types/discussion";

export const discussionSteps: DiscussionStep[] = [
  {
    step: 1,
    title: "Werte bestimmen",
    prompt:
      "Wähle die Werte aus, die für dich in dieser Diskussion zentral sind.",
    helper: "Material: \"Welche Werte habe ich?\""
  },
  {
    step: 2,
    title: "Werterahmen festlegen",
    prompt:
      "Legt gemeinsam fest, welche Werte in den Wertekatalog (Werterahmen) aufgenommen werden."
  },
  {
    step: 3,
    title: "Normen bestimmen",
    prompt:
      "Welche Normen lassen sich aus deinen Werten ableiten?"
  },
  {
    step: 4,
    title: "Inklusionsproblem",
    prompt:
      "Wer oder was muss geschützt werden? Begründe den Rahmen anhand der Normen."
  },
  {
    step: 5,
    title: "Diskussion",
    prompt:
      "Was ist dir wichtig? Formuliere Fragen, die du gerne diskutieren möchtest."
  },
  {
    step: 6,
    title: "Fazit",
    prompt:
      "Formuliere dein Fazit zur Diskussion."
  }
];
