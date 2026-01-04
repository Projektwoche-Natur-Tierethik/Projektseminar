"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ValueSelector from "@/src/components/discussion/ValueSelector";
import StepForm from "@/src/components/discussion/StepForm";
import { discussionSteps } from "@/src/config/discussion";
import { selectionCount, valuesList } from "@/src/config/values";
import { timerDefaults } from "@/src/config/timers";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Stepper } from "@/src/components/ui/Stepper";
import type { AggregatedValue } from "@/src/types/discussion";

export default function DiscussionStepPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const step = Number(params.step);
  const code = searchParams.get("code") ?? "";
  const name = searchParams.get("name") ?? "";

  const stepData = discussionSteps.find((item) => item.step === step);
  const stepLabels = useMemo(
    () => discussionSteps.map((item) => ({ label: item.title, step: item.step })),
    []
  );

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [topValues, setTopValues] = useState<AggregatedValue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step !== 1 || !code) return;

    fetch(`/api/diskussion/werte?code=${code}`)
      .then((res) => res.json())
      .then((data) => setTopValues(data.topValues ?? []))
      .catch(() => setTopValues([]));
  }, [step, code]);

  if (!stepData) {
    return (
      <div className="container mx-auto pt-12">
        <p>Schritt nicht gefunden.</p>
      </div>
    );
  }

  async function handleValuesSubmit() {
    setLoading(true);
    await fetch("/api/diskussion/werte", {
      method: "POST",
      body: JSON.stringify({ code, name, values: selectedValues }),
      headers: { "Content-Type": "application/json" }
    });
    const response = await fetch(`/api/diskussion/werte?code=${code}`);
    const data = await response.json();
    setTopValues(data.topValues ?? []);
    setLoading(false);
    router.push(`/diskussion/schritt/2?code=${code}&name=${encodeURIComponent(name)}`);
  }

  async function handleStepSubmit(value: string) {
    await fetch("/api/diskussion/step", {
      method: "POST",
      body: JSON.stringify({ code, name, step, response: value }),
      headers: { "Content-Type": "application/json" }
    });

    if (step < 5) {
      router.push(
        `/diskussion/schritt/${step + 1}?code=${code}&name=${encodeURIComponent(
          name
        )}`
      );
    } else {
      router.push(`/diskussion/auswertung/${code}`);
    }
  }

  if (!name) {
    return (
      <div className="container mx-auto pt-12">
        <p className="text-muted">
          Bitte zuerst ueber die Lobby oder Join-Seite beitreten.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <Stepper steps={stepLabels} current={step} />

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Schritt {step}: {stepData.title}
        </h1>
        <p className="text-muted">{stepData.prompt}</p>
        <p className="text-xs text-muted">
          Timer-Default:{" "}
          {step === 1
            ? timerDefaults.step1Minutes
            : step === 2
              ? timerDefaults.step2Minutes
              : step === 3
                ? timerDefaults.step3Minutes
                : step === 4
                  ? timerDefaults.step4Minutes
                  : timerDefaults.step5Minutes}{" "}
          Minuten
        </p>
      </header>

      {step === 1 ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <CardTitle>Werte auswaehlen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted">
                Waehle {selectionCount} Werte aus, die dir am wichtigsten sind.
              </p>
              <ValueSelector
                values={valuesList}
                selected={selectedValues}
                max={selectionCount}
                onChange={setSelectedValues}
              />
              <Button
                onClick={handleValuesSubmit}
                disabled={selectedValues.length !== selectionCount || loading}
              >
                Werte speichern & weiter
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meine Werte</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                {selectedValues.length > 0
                  ? selectedValues.join(", ")
                  : "Noch keine Werte ausgewaehlt."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Werte (aggregiert)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted">
                {topValues.length > 0 ? (
                  topValues.map((item) => (
                    <div key={item.value} className="flex justify-between">
                      <span>{item.value}</span>
                      <span>{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p>Noch keine Daten.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Deine Antwort</CardTitle>
          </CardHeader>
          <CardContent>
            <StepForm
              prompt={stepData.prompt}
              helper={stepData.helper}
              onSubmit={handleStepSubmit}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
