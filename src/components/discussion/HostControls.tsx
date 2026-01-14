"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";

type HostControlsProps = {
  code: string;
  name: string;
  initialStep: number;
};

export default function HostControls({ code, name, initialStep }: HostControlsProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(action: "start" | "next" | "finish") {
    setLoading(true);
    setError("");
    const response = await fetch("/api/diskussion/control", {
      method: "POST",
      body: JSON.stringify({ code, name, action }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      setError("Aktion konnte nicht ausgefuehrt werden.");
      setLoading(false);
      return;
    }

    const data = await response.json();
    setCurrentStep(data.currentStep ?? currentStep);
    setLoading(false);
  }

  const isFinished = currentStep >= 6;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Aktueller Schritt:{" "}
        {currentStep === 0
          ? "Noch nicht gestartet"
          : currentStep > 5
            ? "Auswertung"
            : `Schritt ${currentStep}`}
      </p>
      <div className="flex flex-wrap gap-2">
        {currentStep === 0 && (
          <Button onClick={() => handleAction("start")} disabled={loading}>
            Diskussion starten
          </Button>
        )}
        {currentStep > 0 && currentStep < 5 && (
          <Button onClick={() => handleAction("next")} disabled={loading}>
            Naechsten Schritt freigeben
          </Button>
        )}
        {currentStep === 5 && (
          <Button onClick={() => handleAction("finish")} disabled={loading}>
            Auswertung freigeben
          </Button>
        )}
      </div>
      {isFinished && (
        <p className="text-sm text-muted">
          Die Diskussion ist abgeschlossen.
        </p>
      )}
      {error && <p className="text-sm text-accent2">{error}</p>}
    </div>
  );
}
