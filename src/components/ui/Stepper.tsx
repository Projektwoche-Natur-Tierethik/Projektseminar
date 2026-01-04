import { cn } from "@/src/lib/utils";

type StepperProps = {
  steps: { label: string; step: number }[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {steps.map((step) => (
        <div
          key={step.step}
          className={cn(
            "flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs",
            current === step.step
              ? "bg-accent text-white"
              : "bg-surface text-muted"
          )}
        >
          <span className="font-semibold">{step.step}</span>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
