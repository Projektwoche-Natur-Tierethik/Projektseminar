import { cn } from "@/src/lib/utils";

type StepperProps = {
  steps: { label: string; step: number }[];
  current: number;
  onStepClick?: (step: number) => void;
  maxClickableStep?: number | null;
};

export function Stepper({ steps, current, onStepClick, maxClickableStep }: StepperProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {steps.map((step) => (
        <button
          key={step.step}
          className={cn(
            "flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs",
            current === step.step
              ? "bg-accent text-white"
              : "bg-surface text-muted",
            onStepClick && maxClickableStep !== null && step.step <= maxClickableStep
              ? "cursor-pointer hover:text-ink"
              : "cursor-default"
          )}
          type="button"
          disabled={!(onStepClick && maxClickableStep !== null && step.step <= maxClickableStep)}
          onClick={() => {
            if (onStepClick) onStepClick(step.step);
          }}
        >
          <span className="font-semibold">{step.step}</span>
          <span>{step.label}</span>
        </button>
      ))}
    </div>
  );
}
