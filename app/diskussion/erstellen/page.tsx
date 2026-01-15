"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { valuesList } from "@/src/config/values";
import { defaultDiscussionSettings } from "@/src/lib/discussion-settings";

export default function CreateDiscussionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [hostName, setHostName] = useState("");
  const [error, setError] = useState("");
  const [normsEnabled, setNormsEnabled] = useState(
    defaultDiscussionSettings.normsEnabled
  );
  const [inclusionEnabled, setInclusionEnabled] = useState(
    defaultDiscussionSettings.inclusionEnabled
  );
  const [valuesCount, setValuesCount] = useState(
    defaultDiscussionSettings.valuesCount
  );
  const [questionsCount, setQuestionsCount] = useState(
    defaultDiscussionSettings.questionsCount
  );

  async function handleCreate() {
    setError("");
    const normalizedValuesCount = Number.isFinite(valuesCount)
      ? Math.min(Math.max(valuesCount, 1), valuesList.length)
      : defaultDiscussionSettings.valuesCount;
    const normalizedQuestionsCount = Number.isFinite(questionsCount)
      ? Math.min(Math.max(questionsCount, 1), 20)
      : defaultDiscussionSettings.questionsCount;
    const response = await fetch("/api/diskussion/create", {
      method: "POST",
      body: JSON.stringify({
        question,
        hostName,
        normsPartOf: normsEnabled,
        inclusionProblemPartOf: inclusionEnabled,
        selectionCount: normalizedValuesCount,
        questionsPerParticipant: normalizedQuestionsCount
      }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      setError("Diskussion konnte nicht erstellt werden.");
      return;
    }
    const data = await response.json();
    router.push(
      `/diskussion/lobby/${data.code}?name=${encodeURIComponent(hostName)}`
    );
  }

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Diskussion erstellen</h1>
        <p className="text-muted">
          Formuliere die Fragestellung und lege die Leitung fest.
        </p>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Fragestellung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Name der Leitung"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
          />
          <Textarea
            rows={5}
            placeholder="z.B. Wie sieht ein ethisch vertretbarer Zoo aus?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <Button onClick={handleCreate} disabled={!question.trim() || !hostName.trim()}>
            Diskussion erstellen
          </Button>
          {error && <p className="text-sm text-accent2">{error}</p>}
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ablauf anpassen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted">
          <p>Lege fest, welche Schritte aktiv sind und wie viele Fragen erlaubt sind.</p>
          <div className="space-y-3 text-ink">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={normsEnabled}
                onChange={(event) => setNormsEnabled(event.target.checked)}
              />
              Normen aktiv
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={inclusionEnabled}
                onChange={(event) => setInclusionEnabled(event.target.checked)}
              />
              Inklusionsproblem aktiv
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-ink">
              <span>Anzahl auswählbarer Werte</span>
              <Input
                type="number"
                min={1}
                max={valuesList.length}
                value={valuesCount}
                onChange={(event) => setValuesCount(Number(event.target.value))}
              />
              <span className="text-xs text-muted">
                Maximal {valuesList.length} Werte.
              </span>
            </label>
            <label className="space-y-2 text-sm text-ink">
              <span>Diskussionsfragen pro Person</span>
              <Input
                type="number"
                min={1}
                max={20}
                value={questionsCount}
                onChange={(event) => setQuestionsCount(Number(event.target.value))}
              />
              <span className="text-xs text-muted">Maximal 20 Fragen.</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
