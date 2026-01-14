"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ValueSelector from "@/src/components/discussion/ValueSelector";
import StepForm from "@/src/components/discussion/StepForm";
import QuestionsForm from "@/src/components/discussion/QuestionsForm";
import { discussionSteps } from "@/src/config/discussion";
import { valuesList } from "@/src/config/values";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Button, buttonStyles } from "@/src/components/ui/Button";
import { Stepper } from "@/src/components/ui/Stepper";
import {
  defaultDiscussionSettings,
  getEnabledSteps,
  isStepEnabled,
  normalizeDiscussionSettings
} from "@/src/lib/discussion-settings";
import type { AggregatedValue } from "@/src/types/discussion";

export default function DiscussionStepPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const step = Number(params.step);
  const code = searchParams.get("code") ?? "";
  const name = searchParams.get("name") ?? "";

  const [settings, setSettings] = useState(defaultDiscussionSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const enabledSteps = useMemo(() => getEnabledSteps(settings), [settings]);

  const stepData = discussionSteps.find((item) => item.step === step);
  const stepLabels = useMemo(
    () =>
      discussionSteps
        .filter((item) => isStepEnabled(item.step, settings))
        .map((item) => ({ label: item.title, step: item.step })),
    [settings]
  );

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [topValues, setTopValues] = useState<AggregatedValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [readyUpdatedAt, setReadyUpdatedAt] = useState<string | null>(null);
  const valuesCount = settings.valuesCount;
  const questionsCount = settings.questionsCount;

  const currentEnabledStep = useMemo(() => {
    if (currentStep === null) return null;
    if (currentStep <= 0) return 0;
    const available = enabledSteps.filter((item) => item <= currentStep);
    return available.length > 0 ? available[available.length - 1] : enabledSteps[0] ?? currentStep;
  }, [currentStep, enabledSteps]);
  const nextEnabledStep = useMemo(
    () => enabledSteps.find((item) => item > step) ?? null,
    [enabledSteps, step]
  );

  useEffect(() => {
    if (step !== 1 || !code) return;

    fetch(`/api/diskussion/werte?code=${code}`)
      .then((res) => res.json())
      .then((data) => setTopValues(data.topValues ?? []))
      .catch(() => setTopValues([]));
  }, [step, code]);

  useEffect(() => {
    if (!code) return;
    let isMounted = true;
    fetch(`/api/discussions?code=${encodeURIComponent(code)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setSettings(normalizeDiscussionSettings(data.discussion));
        setSettingsLoaded(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setSettingsLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, [code]);

  useEffect(() => {
    if (!code) return;
    let isMounted = true;
    const fetchStatus = () => {
      fetch(`/api/diskussion/status?code=${code}&name=${encodeURIComponent(name)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          setCurrentStep(Number(data.currentStep ?? 0));
          setIsHost(Boolean(data.isHost));
        })
        .catch(() => {
          if (!isMounted) return;
          setCurrentStep(0);
          setIsHost(false);
        });
    };

    fetchStatus();
    const interval = window.setInterval(fetchStatus, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [code, name]);

  useEffect(() => {
    if (!code || !name || !step) return;
    fetch(
      `/api/diskussion/ready?code=${code}&name=${encodeURIComponent(
        name
      )}&step=${step}`
    )
      .then((res) => res.json())
      .then((data) => {
        setIsReady(Boolean(data.ready));
        setReadyUpdatedAt(data.updatedAt ?? null);
      })
      .catch(() => {
        setIsReady(false);
        setReadyUpdatedAt(null);
      });
  }, [code, name, step]);

  if (!stepData) {
    return (
      <div className="container mx-auto pt-12">
        <p>Schritt nicht gefunden.</p>
      </div>
    );
  }

  if (!isStepEnabled(step, settings)) {
    return (
      <div className="container mx-auto space-y-4 pt-12">
        <p className="text-muted">Dieser Schritt ist deaktiviert.</p>
        {nextEnabledStep ? (
          <Link
            href={`/diskussion/schritt/${nextEnabledStep}?code=${code}&name=${encodeURIComponent(
              name
            )}`}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Zum naechsten aktiven Schritt
          </Link>
        ) : (
          <Link
            href={`/diskussion/lobby/${code}?name=${encodeURIComponent(name)}`}
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Zurueck zur Lobby
          </Link>
        )}
      </div>
    );
  }

  async function handleValuesSubmit() {
    setLoading(true);
    setStatusMessage("");
    await fetch("/api/diskussion/werte", {
      method: "POST",
      body: JSON.stringify({ code, name, values: selectedValues }),
      headers: { "Content-Type": "application/json" }
    });
    const response = await fetch(`/api/diskussion/werte?code=${code}`);
    const data = await response.json();
    setTopValues(data.topValues ?? []);
    setLoading(false);
    setStatusMessage("Antwort gespeichert. Warte auf die Freigabe des naechsten Schritts.");
  }

  async function handleStepSubmit(value: string) {
    setStatusMessage("");
    await fetch("/api/diskussion/step", {
      method: "POST",
      body: JSON.stringify({ code, name, step, response: value }),
      headers: { "Content-Type": "application/json" }
    });

    setStatusMessage("Antwort gespeichert. Warte auf die Freigabe des naechsten Schritts.");
  }

  async function handleQuestionsSubmit(questions: string[]) {
    const cleaned = questions.map((item) => item.trim()).filter(Boolean);
    const response = cleaned.map((item, index) => `${index + 1}. ${item}`).join("\n");
    await handleStepSubmit(response);
  }

  async function handleReadyToggle(nextReady: boolean) {
    setStatusMessage("");
    const response = await fetch("/api/diskussion/ready", {
      method: "POST",
      body: JSON.stringify({ code, name, step, ready: nextReady }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      setStatusMessage("Status konnte nicht gespeichert werden.");
      return;
    }

    const data = await response.json();
    setIsReady(Boolean(data.ready));
    setReadyUpdatedAt(data.updatedAt ?? null);
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

  if (!settingsLoaded) {
    return (
      <div className="container mx-auto pt-12">
        <p className="text-muted">Einstellungen werden geladen...</p>
      </div>
    );
  }

  if (currentStep === null) {
    return (
      <div className="container mx-auto pt-12">
        <p className="text-muted">Status wird geladen...</p>
      </div>
    );
  }

  if (!isHost) {
    if (currentEnabledStep === 0) {
      return (
        <div className="container mx-auto space-y-4 pt-12">
          <p className="text-muted">
            Die Diskussion wurde noch nicht gestartet.
          </p>
          <Link
            href={`/diskussion/lobby/${code}?name=${encodeURIComponent(name)}`}
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Zurueck zur Lobby
          </Link>
        </div>
      );
    }

    if (currentEnabledStep !== null && currentEnabledStep < step) {
      return (
        <div className="container mx-auto space-y-4 pt-12">
          <p className="text-muted">
            Dieser Schritt ist noch nicht freigegeben.
          </p>
          <Link
            href={`/diskussion/schritt/${currentEnabledStep}?code=${code}&name=${encodeURIComponent(
              name
            )}`}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Zum aktuellen Schritt
          </Link>
        </div>
      );
    }

    if (currentStep !== null && currentStep > 5) {
      return (
        <div className="container mx-auto space-y-4 pt-12">
          <p className="text-muted">
            Die Diskussion ist abgeschlossen. Die Auswertung ist verfuegbar.
          </p>
          <Link
            href={`/diskussion/auswertung/${code}`}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Zur Auswertung
          </Link>
        </div>
      );
    }
  }

  const stepPrompt =
    step === 4
      ? `Stelle bis zu ${questionsCount} Fragen, die du gerne diskutieren moechtest.`
      : stepData.prompt;

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <Stepper steps={stepLabels} current={step} />

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Schritt {step}: {stepData.title}
        </h1>
        <p className="text-muted">{stepPrompt}</p>
      </header>
      {!isHost &&
        currentEnabledStep !== null &&
        currentEnabledStep > step &&
        currentEnabledStep <= 5 && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-sm text-muted">
              Der naechste Schritt ist freigeschaltet.
            </p>
          <Link
            href={`/diskussion/schritt/${currentEnabledStep}?code=${code}&name=${encodeURIComponent(
              name
            )}`}
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            Zum naechsten Schritt
          </Link>
          </CardContent>
        </Card>
      )}

      {step === 1 ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <CardTitle>Werte auswaehlen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted">
                Waehle {valuesCount} Werte aus, die dir am wichtigsten sind.
              </p>
              <ValueSelector
                values={valuesList}
                selected={selectedValues}
                max={valuesCount}
                onChange={setSelectedValues}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleValuesSubmit}
                  disabled={selectedValues.length !== valuesCount || loading}
                >
                  Werte speichern
                </Button>
                {!isHost && (
                  <Button
                    onClick={() => handleReadyToggle(!isReady)}
                    variant={isReady ? "outline" : "primary"}
                    disabled={selectedValues.length !== valuesCount}
                  >
                    {isReady ? "Nicht bereit" : "Bereit melden"}
                  </Button>
                )}
              </div>
              {statusMessage && (
                <p className="text-sm text-muted">{statusMessage}</p>
              )}
              {readyUpdatedAt && (
                <p className="text-xs text-muted">
                  Status zuletzt geaendert:{" "}
                  {new Date(readyUpdatedAt).toLocaleString("de-DE")}
                </p>
              )}
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
            {step === 4 ? (
              <QuestionsForm
                maxQuestions={questionsCount}
                onSubmit={handleQuestionsSubmit}
              />
            ) : (
              <StepForm
                prompt={stepPrompt}
                helper={stepData.helper}
                onSubmit={handleStepSubmit}
              />
            )}
            {!isHost && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => handleReadyToggle(!isReady)}
                  variant={isReady ? "outline" : "primary"}
                >
                  {isReady ? "Nicht bereit" : "Bereit melden"}
                </Button>
              </div>
            )}
            {statusMessage && (
              <p className="mt-4 text-sm text-muted">{statusMessage}</p>
            )}
            {readyUpdatedAt && (
              <p className="mt-2 text-xs text-muted">
                Status zuletzt geaendert:{" "}
                {new Date(readyUpdatedAt).toLocaleString("de-DE")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
