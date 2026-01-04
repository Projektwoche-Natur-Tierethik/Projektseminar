"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export default function CreateDiscussionPage() {
  const [question, setQuestion] = useState("");
  const [hostName, setHostName] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    const response = await fetch("/api/diskussion/create", {
      method: "POST",
      body: JSON.stringify({ question, hostName }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      setError("Diskussion konnte nicht erstellt werden.");
      return;
    }
    const data = await response.json();
    setCode(data.code);
  }

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Diskussion erstellen</h1>
        <p className="text-muted">
          Formuliere die Fragestellung und erhalte einen Zugangscode.
        </p>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Fragestellung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Dein Name (optional)"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
          />
          <Textarea
            rows={5}
            placeholder="z.B. Wie sieht ein ethisch vertretbarer Zoo aus?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <Button onClick={handleCreate} disabled={!question.trim()}>
            Diskussion erstellen
          </Button>
          {error && <p className="text-sm text-accent2">{error}</p>}
          {code && (
            <div className="rounded-xl border border-border bg-bg p-4 text-sm">
              <p className="text-muted">Diskussionscode</p>
              <p className="text-2xl font-semibold text-ink">{code}</p>
              <p className="mt-2 text-muted">
                Teile diesen Code mit den Teilnehmenden.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
