"use client";

import { useState } from "react";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";

type StepFormProps = {
  prompt: string;
  helper?: string;
  onSubmit: (value: string) => Promise<void>;
};

export default function StepForm({ prompt, helper, onSubmit }: StepFormProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted">{prompt}</p>
        {helper && <p className="text-xs text-muted">{helper}</p>}
      </div>
      <Textarea
        rows={6}
        placeholder="Deine Antwort..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button
        onClick={async () => {
          setLoading(true);
          await onSubmit(value);
          setLoading(false);
          setValue("");
        }}
        disabled={loading || !value.trim()}
      >
        Antwort speichern
      </Button>
    </div>
  );
}
