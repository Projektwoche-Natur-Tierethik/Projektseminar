"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import {
  type DiscussionSettings,
  getDisplayStepNumber,
  getEnabledSteps
} from "@/src/lib/discussion-settings";

type HostControlsProps = {
  code: string;
  name: string;
  initialStep: number;
  settings: DiscussionSettings;
  onStepChange?: (nextStep: number) => void;
};

export default function HostControls({
  code,
  name,
  initialStep,
  settings,
  onStepChange
}: HostControlsProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  async function fetchCurrentStep() {
    const response = await fetch(
      `/api/diskussion/status?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`
    );
    if (!response.ok) return currentStep;
    const data = await response.json();
    return Number(data.currentStep ?? currentStep);
  }

  async function advanceStep() {
    const response = await fetch("/api/diskussion/control", {
      method: "POST",
      body: JSON.stringify({ code, name, action: "next" }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error("step_failed");
    }

    const data = await response.json();
    return Number(data.currentStep ?? currentStep + 1);
  }

  async function handleAction(action: "start" | "next" | "finish") {
    setLoading(true);
    setError("");
    try {
      if (action === "start") {
        const response = await fetch("/api/diskussion/control", {
          method: "POST",
          body: JSON.stringify({ code, name, action }),
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          setError("Aktion konnte nicht ausgeführt werden.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const nextStep = Number(data.currentStep ?? 1);
        if (nextStep >= 1 && nextStep <= 6) {
          router.push(
            `/diskussion/schritt/${nextStep}?code=${code}&name=${encodeURIComponent(name)}`
          );
        } else if (nextStep > 6) {
          router.push(`/diskussion/schritt/6?code=${code}&name=${encodeURIComponent(name)}`);
        }
        return;
      }

      if (action === "next") {
        const liveStep = await fetchCurrentStep();
        if (liveStep === 1) {
          const valuesResponse = await fetch(
            `/api/diskussion/werte?code=${encodeURIComponent(code)}&t=${Date.now()}`
          );
          if (!valuesResponse.ok) {
            setError("Werte konnten nicht geprüft werden.");
            setLoading(false);
            return;
          }
          const valuesData = await valuesResponse.json();
          const topValues = Array.isArray(valuesData.topValues) ? valuesData.topValues : [];
          const hasAnySelection = topValues.some((item: any) => Number(item?.count ?? 0) > 0);
          if (!hasAnySelection) {
            setError("Der nächste Schritt ist erst möglich, wenn mindestens ein Wert gewählt wurde.");
            setLoading(false);
            return;
          }
        }
        const enabledSteps = getEnabledSteps(settings);
        const currentIndex = enabledSteps.indexOf(liveStep);
        const nextStep =
          currentIndex >= 0 ? enabledSteps[currentIndex + 1] : enabledSteps[0];

        if (!nextStep) {
          setLoading(false);
          return;
        }

        let step = liveStep;
        while (step < nextStep) {
          step = await advanceStep();
        }
        setCurrentStep(step);
        onStepChange?.(step);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/diskussion/control", {
        method: "POST",
        body: JSON.stringify({ code, name, action }),
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        setError("Aktion konnte nicht ausgeführt werden.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const nextStep = Number(data.currentStep ?? currentStep);
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
      setLoading(false);
    } catch {
      setError("Aktion konnte nicht ausgeführt werden.");
      setLoading(false);
    }
  }

  const isFinished = currentStep >= 7;
  const displayStepNumber = getDisplayStepNumber(currentStep, settings);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Aktueller Schritt:{" "}
        {currentStep === 0
          ? "Noch nicht gestartet"
          : currentStep > 6
            ? "Auswertung"
            : `Schritt ${displayStepNumber ?? currentStep}`}
      </p>
      <div className="flex flex-wrap gap-2">
        {currentStep === 0 && (
          <Button onClick={() => handleAction("start")} disabled={loading}>
            Diskussion starten
          </Button>
        )}
        {currentStep > 0 && currentStep < 6 && (
          <Button onClick={() => handleAction("next")} disabled={loading}>
            {currentStep === 5 ? "Diskussion beenden" : "Nächsten Schritt freigeben"}
          </Button>
        )}
        {currentStep === 6 && (
          <p className="text-sm text-muted">Fazit ist freigegeben.</p>
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
