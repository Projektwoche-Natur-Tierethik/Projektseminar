"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export default function CreateDiscussionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [hostName, setHostName] = useState("");
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
    </div>
  );
}
