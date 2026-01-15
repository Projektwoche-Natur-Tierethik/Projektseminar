"use client";

import { useMemo } from "react";
import { cn } from "@/src/lib/utils";

type ValueSelectorProps = {
  values: string[];
  selected: string[];
  max: number;
  onChange: (next: string[]) => void;
};

export default function ValueSelector({
  values,
  selected,
  max,
  onChange
}: ValueSelectorProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {values.map((value) => {
        const isSelected = selectedSet.has(value);
        const disabled = !isSelected && selected.length >= max;

        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (isSelected) {
                onChange(selected.filter((item) => item !== value));
              } else {
                onChange([...selected, value]);
              }
            }}
            className={cn(
              "flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm",
              isSelected
                ? "bg-accent text-white"
                : "bg-surface text-ink hover:bg-surface/80",
              disabled && "opacity-50"
            )}
          >
            <span>{value}</span>
            {isSelected && <span className="text-xs">gewählt</span>}
          </button>
        );
      })}
    </div>
  );
}
