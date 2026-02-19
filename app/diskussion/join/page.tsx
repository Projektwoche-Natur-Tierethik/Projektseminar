"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

function JoinDiscussionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const codeParam = (searchParams.get("code") ?? "").trim().toUpperCase();
    const nameParam = (searchParams.get("name") ?? "").trim();
    if (codeParam && !code) {
      setCode(codeParam);
    }
    if (nameParam && !name) {
      setName(nameParam);
    }
  }, [searchParams, code, name]);

  async function handleJoin() {
    setError("");
    const response = await fetch("/api/diskussion/join", {
      method: "POST",
      body: JSON.stringify({ code, name }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      setError("Code oder Name ungueltig.");
      return;
    }
    router.push(
      `/diskussion/lobby/${code}?name=${encodeURIComponent(name)}`
    );
  }

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Diskussion beitreten</h1>
        <p className="text-muted">Code eingeben und mitmachen.</p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Beitreten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Diskussionscode"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          <Input
            placeholder="Dein Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button onClick={handleJoin} disabled={!code.trim() || !name.trim()}>
            Lobby betreten
          </Button>
          {error && <p className="text-sm text-accent2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinDiscussionPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto space-y-4 pb-20 pt-12">
          <h1 className="text-3xl font-semibold">Diskussion beitreten</h1>
          <p className="text-muted">Seite wird geladen…</p>
        </div>
      }
    >
      <JoinDiscussionContent />
    </Suspense>
  );
}
