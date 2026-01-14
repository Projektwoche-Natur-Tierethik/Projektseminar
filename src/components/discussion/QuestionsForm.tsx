"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";

type QuestionsFormProps = {
  maxQuestions: number;
  onSubmit: (questions: string[]) => Promise<void>;
};

export default function QuestionsForm({ maxQuestions, onSubmit }: QuestionsFormProps) {
  const [questions, setQuestions] = useState([""]);
  const [loading, setLoading] = useState(false);

  const cleanedQuestions = useMemo(
    () => questions.map((question) => question.trim()).filter(Boolean),
    [questions]
  );

  const canAdd = questions.length < maxQuestions;
  const canSubmit = cleanedQuestions.length > 0 && !loading;

  function updateQuestion(index: number, value: string) {
    setQuestions((current) => current.map((item, idx) => (idx === index ? value : item)));
  }

  function handleAdd() {
    if (!canAdd) return;
    setQuestions((current) => [...current, ""]);
  }

  function handleRemove(index: number) {
    setQuestions((current) => current.filter((_, idx) => idx !== index));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Du kannst bis zu {maxQuestions} Fragen formulieren.
      </p>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div key={`frage-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Frage {index + 1}</p>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(index)}
                >
                  Entfernen
                </Button>
              )}
            </div>
            <Textarea
              rows={3}
              placeholder="Formuliere eine Diskussionsfrage..."
              value={question}
              onChange={(event) => updateQuestion(index, event.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={handleAdd} disabled={!canAdd}>
          Weitere Frage
        </Button>
        <Button
          onClick={async () => {
            if (!canSubmit) return;
            setLoading(true);
            await onSubmit(cleanedQuestions);
            setLoading(false);
            setQuestions([""]);
          }}
          disabled={!canSubmit}
        >
          Fragen speichern
        </Button>
      </div>
      <p className="text-xs text-muted">
        {cleanedQuestions.length} / {maxQuestions} Fragen eingetragen.
      </p>
    </div>
  );
}
