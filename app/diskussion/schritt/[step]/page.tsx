"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ValueSelector from "@/src/components/discussion/ValueSelector";
import StepForm from "@/src/components/discussion/StepForm";
import QuestionsForm from "@/src/components/discussion/QuestionsForm";
import HostControls from "@/src/components/discussion/HostControls";
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
  const router = useRouter();
  const step = Number(params.step);
  const code = searchParams.get("code") ?? "";
  const name = searchParams.get("name") ?? "";

  const [settings, setSettings] = useState(defaultDiscussionSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [discussionId, setDiscussionId] = useState<string | null>(null);
  const enabledSteps = useMemo(() => getEnabledSteps(settings), [settings]);

  const stepData = discussionSteps.find((item) => item.step === step);
  const enabledStepEntries = useMemo(() => {
    return discussionSteps
      .filter((item) => isStepEnabled(item.step, settings))
      .map((item, index) => ({ ...item, displayStep: index + 1 }));
  }, [settings]);
  const displayStepByActual = useMemo(() => {
    return enabledStepEntries.reduce((acc, item) => {
      acc[item.step] = item.displayStep;
      return acc;
    }, {} as Record<number, number>);
  }, [enabledStepEntries]);
  const displayStepNumber = displayStepByActual[step] ?? step;
  const stepLabels = useMemo(
    () => enabledStepEntries.map((item) => ({ label: item.title, step: item.displayStep })),
    [enabledStepEntries]
  );

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [topValues, setTopValues] = useState<AggregatedValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [readyUpdatedAt, setReadyUpdatedAt] = useState<string | null>(null);
  const [valueIdByLabel, setValueIdByLabel] = useState<Record<string, string>>({});
  const [frameSelections, setFrameSelections] = useState<Record<string, boolean>>({});
  const [frameExists, setFrameExists] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [readyCount, setReadyCount] = useState<number | null>(null);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [adminError, setAdminError] = useState("");
  const [adminSaving, setAdminSaving] = useState<string | null>(null);
  const [adminParticipants, setAdminParticipants] = useState<any[]>([]);
  const [selectedNormValueId, setSelectedNormValueId] = useState("");
  const [normText, setNormText] = useState("");
  const [normError, setNormError] = useState("");
  const [normSaving, setNormSaving] = useState(false);
  const [userNorms, setUserNorms] = useState<any[]>([]);
  const [adminNorms, setAdminNorms] = useState<any[]>([]);
  const [discussionPoints, setDiscussionPoints] = useState<any[]>([]);
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [userValueIds, setUserValueIds] = useState<string[]>([]);
  const [discussionTheme, setDiscussionTheme] = useState("");
  const [currentDiscussionPointId, setCurrentDiscussionPointId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [discussionActionError, setDiscussionActionError] = useState("");
  const [discussionActionLoading, setDiscussionActionLoading] = useState(false);
  const currentPointRef = useRef<string | null>(null);
  const valuesCount = settings.valuesCount;
  const questionsCount = settings.questionsCount;
  const allParticipantsReady =
    participantCount !== null && readyCount !== null && readyCount >= participantCount;
  const remainingParticipants =
    participantCount !== null && readyCount !== null
      ? Math.max(participantCount - readyCount, 0)
      : null;
  const adminUserId = isHost ? userId : null;
  const valueLabelById = useMemo(() => {
    return Object.entries(valueIdByLabel).reduce((acc, [label, id]) => {
      acc[id] = label;
      return acc;
    }, {} as Record<string, string>);
  }, [valueIdByLabel]);
  const participantNameByUserId = useMemo(() => {
    return adminParticipants.reduce((acc: Record<string, string>, item: any) => {
      if (item.userId && item.user?.name) {
        acc[item.userId] = item.user.name;
      }
      return acc;
    }, {});
  }, [adminParticipants]);
  const adminNormsByUser = useMemo(() => {
    return adminNorms.reduce((acc: Record<string, any[]>, norm: any) => {
      const key = norm.userId ?? "unbekannt";
      if (!acc[key]) acc[key] = [];
      acc[key].push(norm);
      return acc;
    }, {});
  }, [adminNorms]);
  const topValueCounts = useMemo(() => {
    return topValues.reduce((acc, item) => {
      acc[item.value] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }, [topValues]);
  const selectedValueLabels = useMemo(() => {
    const labelsFromIds = userValueIds
      .map((valueId) => valueLabelById[valueId])
      .filter(Boolean);
    return new Set([...selectedValues, ...labelsFromIds]);
  }, [selectedValues, userValueIds, valueLabelById]);
  const catalogValues = useMemo(() => {
    if (!isHost) return valuesList;
    return [...valuesList].sort((left, right) => {
      const diff = (topValueCounts[right] ?? 0) - (topValueCounts[left] ?? 0);
      if (diff !== 0) return diff;
      return left.localeCompare(right, "de-DE");
    });
  }, [isHost, topValueCounts]);
  const catalogValueIds = useMemo(() => {
    return new Set(
      Object.entries(frameSelections)
        .filter(([, selected]) => selected)
        .map(([valueId]) => valueId)
    );
  }, [frameSelections]);
  const catalogValueLabels = useMemo(() => {
    return valuesList.filter((label) => {
      const valueId = valueIdByLabel[label];
      return valueId ? catalogValueIds.has(valueId) : false;
    });
  }, [catalogValueIds, valueIdByLabel]);
  const selectedCatalogValues = useMemo(() => {
    return Object.entries(frameSelections)
      .filter(([, selected]) => selected)
      .map(([valueId]) => valueLabelById[valueId])
      .filter(Boolean);
  }, [frameSelections, valueLabelById]);

  const currentEnabledStep = useMemo(() => {
    if (currentStep === null) return null;
    if (currentStep <= 0) return 0;
    const available = enabledSteps.filter((item) => item <= currentStep);
    return available.length > 0 ? available[available.length - 1] : enabledSteps[0] ?? currentStep;
  }, [currentStep, enabledSteps]);
  const maxDisplayStep =
    currentEnabledStep !== null ? displayStepByActual[currentEnabledStep] ?? null : null;
  const isReviewMode =
    !isHost && currentEnabledStep !== null && currentEnabledStep > step;
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
        setDiscussionId(data.discussion?.id ?? null);
        setDiscussionTheme(data.discussion?.discussionTheme ?? "");
        setCurrentDiscussionPointId(data.discussion?.currentDiscussionPointId ?? null);
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
    if (!name) return;
    let isMounted = true;
    fetch(`/api/users?name=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setUserId(data.user?.id ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setUserId(null);
      });
    return () => {
      isMounted = false;
    };
  }, [name]);

  useEffect(() => {
    if (!discussionId) return;
    let isMounted = true;
    fetch("/api/values")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const byLabel = (data.values ?? []).reduce((acc: Record<string, string>, item: any) => {
          const rawId = item?.valueId ?? item?.id;
          if (item?.value !== undefined && rawId !== undefined) {
            acc[item.value] = String(rawId);
          }
          return acc;
        }, {});
        setValueIdByLabel(byLabel);
      })
      .catch(() => {
        if (!isMounted) return;
        setValueIdByLabel({});
      });
    return () => {
      isMounted = false;
    };
  }, [discussionId]);

  useEffect(() => {
    if (!isHost || !discussionId) return;
    let isMounted = true;
    const fetchAdminState = () => {
      fetch(
        `/api/participants?discussionId=${encodeURIComponent(discussionId)}&includeUser=true`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const participants = Array.isArray(data.participants) ? data.participants : [];
          const activeParticipants = participants.filter((item: any) => !item.admin);
          const readyTotal = activeParticipants.filter((item: any) => item.continueButton).length;
          setParticipantCount(activeParticipants.length);
          setReadyCount(readyTotal);
          setAdminParticipants(activeParticipants);
        })
        .catch(() => {
          if (!isMounted) return;
          setParticipantCount(null);
          setReadyCount(null);
          setAdminParticipants([]);
        });
    };

    fetchAdminState();
    const interval = window.setInterval(fetchAdminState, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [isHost, discussionId]);

  useEffect(() => {
    if (!discussionId) return;
    let isMounted = true;
    const fetchFrameValues = () => {
      fetch(`/api/frame-of-values?discussionId=${encodeURIComponent(discussionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const items = Array.isArray(data.items) ? data.items : [];
          const selections = items.reduce((acc: Record<string, boolean>, item: any) => {
            acc[item.valueId] = item.partOfFrame;
            return acc;
          }, {});
          const exists = items.reduce((acc: Record<string, boolean>, item: any) => {
            acc[item.valueId] = true;
            return acc;
          }, {});
          setFrameSelections(selections);
          setFrameExists(exists);
        })
        .catch(() => {
          if (!isMounted) return;
          setFrameSelections({});
          setFrameExists({});
        });
    };
    fetchFrameValues();
    const interval = window.setInterval(fetchFrameValues, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId]);

  useEffect(() => {
    if (!discussionId || !userId || step !== 2) return;
    let isMounted = true;
    fetch(
      `/api/norms?discussionId=${encodeURIComponent(
        discussionId
      )}&userId=${encodeURIComponent(userId)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setUserNorms(Array.isArray(data.norms) ? data.norms : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setUserNorms([]);
      });
    return () => {
      isMounted = false;
    };
  }, [discussionId, userId, step]);

  useEffect(() => {
    if (!discussionId || !userId || step !== 1) return;
    let isMounted = true;
    fetch(
      `/api/user-values?discussionId=${encodeURIComponent(
        discussionId
      )}&userId=${encodeURIComponent(userId)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setUserValueIds(items.map((item: any) => item.valueId));
      })
      .catch(() => {
        if (!isMounted) return;
        setUserValueIds([]);
      });
    return () => {
      isMounted = false;
    };
  }, [discussionId, userId, step]);

  useEffect(() => {
    if (step !== 1) return;
    const valuesFromIds = userValueIds
      .map((valueId) => valueLabelById[valueId])
      .filter(Boolean);
    if (valuesFromIds.length > 0) {
      setSelectedValues(valuesFromIds);
    }
  }, [step, userValueIds, valueLabelById]);

  useEffect(() => {
    if (!discussionId || !userId || step !== 4) return;
    let isMounted = true;
    const fetchUserQuestions = () => {
      fetch(
        `/api/diskussion/diskussionspunkte?discussionId=${encodeURIComponent(discussionId)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const items = Array.isArray(data.items) ? data.items : [];
          setUserQuestions(items.filter((item: any) => item.writtenByUserId === userId));
        })
        .catch(() => {
          if (!isMounted) return;
          setUserQuestions([]);
        });
    };
    fetchUserQuestions();
    const interval = window.setInterval(fetchUserQuestions, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, userId, step]);

  useEffect(() => {
    if (!discussionId || !isHost || step !== 2) return;
    let isMounted = true;
    const fetchNorms = () => {
      fetch(`/api/norms?discussionId=${encodeURIComponent(discussionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          setAdminNorms(Array.isArray(data.norms) ? data.norms : []);
        })
        .catch(() => {
          if (!isMounted) return;
          setAdminNorms([]);
        });
    };
    fetchNorms();
    const interval = window.setInterval(fetchNorms, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, isHost, step]);

  useEffect(() => {
    if (!discussionId || step !== 4) return;
    let isMounted = true;
    const fetchQuestions = () => {
      fetch(
        `/api/diskussion/diskussionspunkte?discussionId=${encodeURIComponent(discussionId)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          setDiscussionPoints(Array.isArray(data.items) ? data.items : []);
        })
        .catch(() => {
          if (!isMounted) return;
          setDiscussionPoints([]);
        });
    };
    fetchQuestions();
    const interval = window.setInterval(fetchQuestions, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, step]);

  useEffect(() => {
    if (!discussionId || step !== 4) return;
    let isMounted = true;
    const fetchDiscussionState = () => {
      fetch(`/api/discussions?discussionId=${encodeURIComponent(discussionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          setDiscussionTheme(data.discussion?.discussionTheme ?? "");
          setCurrentDiscussionPointId(data.discussion?.currentDiscussionPointId ?? null);
        })
        .catch(() => {
          if (!isMounted) return;
        });
    };
    fetchDiscussionState();
    const interval = window.setInterval(fetchDiscussionState, 3000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, step]);

  useEffect(() => {
    if (!discussionId || !userId || step !== 4) return;
    let isMounted = true;
    fetch(
      `/api/participants?discussionId=${encodeURIComponent(
        discussionId
      )}&userId=${encodeURIComponent(userId)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const participant = Array.isArray(data.participants) ? data.participants[0] : null;
        setParticipantId(participant?.id ?? null);
        setHasSkipped(Boolean(participant?.moveOnButton));
      })
      .catch(() => {
        if (!isMounted) return;
        setParticipantId(null);
        setHasSkipped(false);
      });
    return () => {
      isMounted = false;
    };
  }, [discussionId, userId, step]);

  useEffect(() => {
    if (step !== 4) return;
    if (currentPointRef.current === currentDiscussionPointId) return;
    currentPointRef.current = currentDiscussionPointId ?? null;
    setHasSkipped(false);
    if (!participantId || !currentDiscussionPointId) return;
    fetch("/api/participants", {
      method: "PUT",
      body: JSON.stringify({ participantId, moveOnButton: false }),
      headers: { "Content-Type": "application/json" }
    }).catch(() => {});
  }, [currentDiscussionPointId, participantId, step]);

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
    if (!discussionId || !userId) {
      setStatusMessage("Fragen konnten nicht gespeichert werden.");
      return;
    }
    const cleaned = questions.map((item) => item.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setStatusMessage("Bitte mindestens eine Frage angeben.");
      return;
    }
    setStatusMessage("");
    try {
      await Promise.all(
        cleaned.map((question) =>
          fetch("/api/diskussion/diskussionspunkte", {
            method: "POST",
            body: JSON.stringify({
              discussionId,
              writtenByUserId: userId,
              discussionPoint: question
            }),
            headers: { "Content-Type": "application/json" }
          })
        )
      );
      setStatusMessage("Fragen gespeichert. Warte auf die Freigabe des naechsten Schritts.");
    } catch {
      setStatusMessage("Fragen konnten nicht gespeichert werden.");
    }
  }

  async function handleNormSubmit() {
    if (!discussionId || !userId) {
      setNormError("Norm konnte nicht gespeichert werden.");
      return;
    }
    if (!selectedNormValueId || !normText.trim()) {
      setNormError("Bitte Wert und Norm angeben.");
      return;
    }
    setNormSaving(true);
    setNormError("");
    try {
      const response = await fetch("/api/norms", {
        method: "POST",
        body: JSON.stringify({
          discussionId,
          userId,
          norm: normText.trim(),
          basedOnValueId: selectedNormValueId,
          partOfFrame: false
        }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("norm_failed");
      }
      const data = await response.json();
      setUserNorms((prev) => [...prev, data.norm]);
      setNormText("");
      setStatusMessage("Norm gespeichert. Warte auf die Freigabe des naechsten Schritts.");
    } catch {
      setNormError("Norm konnte nicht gespeichert werden.");
    } finally {
      setNormSaving(false);
    }
  }

  async function handleFrameToggle(label: string, nextValue: boolean) {
    if (!discussionId || !adminUserId) return;
    const valueId = valueIdByLabel[label];
    setAdminSaving(valueId ?? label);
    setAdminError("");
    try {
      if (!valueId) {
        throw new Error("missing_value_id");
      }

      if (!frameExists[valueId]) {
        const response = await fetch("/api/frame-of-values", {
          method: "POST",
          body: JSON.stringify({ discussionId, valueId, partOfFrame: nextValue }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("create_failed");
        }
        setFrameExists((prev) => ({ ...prev, [valueId]: true }));
        setFrameSelections((prev) => ({ ...prev, [valueId]: nextValue }));
      } else {
        const response = await fetch("/api/frame-of-values", {
          method: "PUT",
          body: JSON.stringify({ discussionId, valueId, partOfFrame: nextValue, adminUserId }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("update_failed");
        }
        setFrameSelections((prev) => ({ ...prev, [valueId]: nextValue }));
      }
    } catch {
      setAdminError("Wertekatalog konnte nicht gespeichert werden.");
    } finally {
      setAdminSaving(null);
    }
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

  async function resetSkipVotes() {
    if (!adminParticipants.length) return;
    await Promise.all(
      adminParticipants.map((participant) =>
        fetch("/api/participants", {
          method: "PUT",
          body: JSON.stringify({ participantId: participant.id, moveOnButton: false }),
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    setAdminParticipants((prev) =>
      prev.map((participant) => ({ ...participant, moveOnButton: false }))
    );
  }

  async function handleStartDiscussionPoint(pointId: string) {
    if (!discussionId || !adminUserId) return;
    setDiscussionActionLoading(true);
    setDiscussionActionError("");
    try {
      const response = await fetch("/api/discussions", {
        method: "PUT",
        body: JSON.stringify({
          discussionId,
          currentDiscussionPointId: pointId,
          adminUserId
        }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("start_failed");
      }
      setCurrentDiscussionPointId(pointId);
      await resetSkipVotes();
    } catch {
      setDiscussionActionError("Frage konnte nicht gestartet werden.");
    } finally {
      setDiscussionActionLoading(false);
    }
  }

  async function handleCompleteDiscussionPoint() {
    if (!currentDiscussionPointId || !adminUserId || !discussionId) return;
    setDiscussionActionLoading(true);
    setDiscussionActionError("");
    try {
      const response = await fetch("/api/diskussion/diskussionspunkte", {
        method: "PUT",
        body: JSON.stringify({
          discussionPointId: currentDiscussionPointId,
          markedAsComplete: true,
          adminUserId
        }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("complete_failed");
      }
      const clearResponse = await fetch("/api/discussions", {
        method: "PUT",
        body: JSON.stringify({
          discussionId,
          currentDiscussionPointId: null,
          adminUserId
        }),
        headers: { "Content-Type": "application/json" }
      });
      if (!clearResponse.ok) {
        throw new Error("clear_failed");
      }
      setCurrentDiscussionPointId(null);
      await resetSkipVotes();
    } catch {
      setDiscussionActionError("Frage konnte nicht beendet werden.");
    } finally {
      setDiscussionActionLoading(false);
    }
  }

  async function handleSkipToggle(nextValue: boolean) {
    if (!participantId) return;
    setDiscussionActionError("");
    try {
      const response = await fetch("/api/participants", {
        method: "PUT",
        body: JSON.stringify({ participantId, moveOnButton: nextValue }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("skip_failed");
      }
      setHasSkipped(nextValue);
    } catch {
      setDiscussionActionError("Status konnte nicht gespeichert werden.");
    }
  }

  async function handleFinishDiscussion() {
    if (!code || !name) return;
    setDiscussionActionLoading(true);
    setDiscussionActionError("");
    try {
      const response = await fetch("/api/diskussion/control", {
        method: "POST",
        body: JSON.stringify({ code, name, action: "finish" }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("finish_failed");
      }
      router.push(`/diskussion/auswertung/${code}`);
    } catch {
      setDiscussionActionError("Auswertung konnte nicht freigegeben werden.");
    } finally {
      setDiscussionActionLoading(false);
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

  const activeDiscussionPoint = discussionPoints.find(
    (item) => item.id === currentDiscussionPointId
  );
  const openDiscussionPoints = discussionPoints.filter((item) => !item.markedAsComplete);
  const skipVotes = adminParticipants.filter((item) => item.moveOnButton).length;

  return (
    <div className="container mx-auto space-y-8 pb-20 pt-12">
      <Stepper
        steps={stepLabels}
        current={displayStepNumber}
        maxClickableStep={maxDisplayStep ?? null}
        onStepClick={(clickedDisplayStep) => {
          const entry = enabledStepEntries.find(
            (item) => item.displayStep === clickedDisplayStep
          );
          if (!entry) return;
          router.push(
            `/diskussion/schritt/${entry.step}?code=${code}&name=${encodeURIComponent(name)}`
          );
        }}
      />

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Schritt {displayStepNumber}: {stepData.title}
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
        {isHost ? (
          <Card>
            <CardHeader>
              <CardTitle>Wertekatalog festlegen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted">
                <p>
                  Waehle frei aus allen genannten Werten. Die Reihenfolge im Ranking
                  spielt keine Rolle.
                </p>
                {participantCount !== null && readyCount !== null && (
                  <p className="text-xs text-muted">
                    Bereitschaft: {readyCount} / {participantCount}
                  </p>
                )}
                {!allParticipantsReady && remainingParticipants !== null && (
                  <p className="text-xs text-muted">
                    Warte auf {remainingParticipants} Teilnehmende.
                  </p>
                )}
                  <div className="space-y-2">
                    {catalogValues.map((label) => {
                      const valueId = valueIdByLabel[label];
                      const checked = valueId ? Boolean(frameSelections[valueId]) : false;
                      const disabled =
                        !allParticipantsReady ||
                        Boolean(adminSaving && adminSaving !== valueId) ||
                        !adminUserId;
                      const count = topValueCounts[label] ?? 0;
                      return (
                        <label
                          key={label}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-primary"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => {
                                handleFrameToggle(label, !checked);
                              }}
                            />
                            <span className="text-sm text-ink">{label}</span>
                          </div>
                          <span className="text-xs text-muted">
                            {count} Stimmen
                          </span>
                        </label>
                      );
                    })}
                  </div>
                {adminError && <p className="text-xs text-accent2">{adminError}</p>}
              </CardContent>
            </Card>
        ) : (
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
                  onChange={isReviewMode ? () => {} : setSelectedValues}
                />
                <div className="flex flex-wrap gap-2">
                  {!isReviewMode && (
                    <>
                      <Button
                        onClick={handleValuesSubmit}
                        disabled={selectedValues.length !== valuesCount || loading}
                      >
                        Werte speichern
                      </Button>
                      <Button
                        onClick={() => handleReadyToggle(!isReady)}
                        variant={isReady ? "outline" : "primary"}
                        disabled={selectedValues.length !== valuesCount}
                      >
                        {isReady ? "Nicht bereit" : "Bereit melden"}
                      </Button>
                    </>
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
          )}

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isHost ? "Wertekatalog" : "Meine Werte"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                {isHost
                  ? selectedCatalogValues.length > 0
                    ? selectedCatalogValues.join(", ")
                    : "Noch kein Wertekatalog ausgewaehlt."
                  : selectedValues.length > 0
                    ? selectedValues.join(", ")
                    : "Noch keine Werte ausgewaehlt."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ranking (Orientierung)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted">
                <p className="text-xs text-muted">
                  Dient nur als Orientierung fuer die spaetere Auswahl.
                </p>
                {topValues.length > 0 ? (
                  topValues.map((item) => {
                    const isSelected = selectedValueLabels.has(item.value);
                    return (
                      <div
                        key={item.value}
                        className={`flex items-center justify-between rounded-lg px-2 py-1 ${
                          isSelected ? "bg-primary/10 text-ink" : ""
                        }`}
                      >
                        <span>{item.value}</span>
                        <span>{item.count}</span>
                      </div>
                    );
                  })
                ) : (
                  <p>Noch keine Daten.</p>
                )}
                <Link
                  href={`/diskussion/werte/${code}?name=${encodeURIComponent(name)}`}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Zum Ranking-Diagramm
                </Link>
              </CardContent>
            </Card>
            {isHost && currentStep !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Leitung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted">
                  <HostControls
                    code={code}
                    name={name}
                    initialStep={currentStep}
                    settings={settings}
                  />
                  {currentEnabledStep !== null && currentEnabledStep > step && (
                    <Link
                      href={`/diskussion/schritt/${currentEnabledStep}?code=${code}&name=${encodeURIComponent(
                        name
                      )}`}
                      className={buttonStyles({ variant: "primary", size: "sm" })}
                    >
                      Zum naechsten Schritt
                    </Link>
                  )}
                  {adminParticipants.length > 0 && (
                    <div className="space-y-2">
                      {adminParticipants.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3 py-2"
                        >
                          <span className="text-ink">{item.user?.name ?? "Unbekannt"}</span>
                          <span className="text-xs text-muted">
                            {item.continueButton ? "bereit" : "nicht bereit"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : step === 2 ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {!isHost && !isReviewMode && (
            <Card>
              <CardHeader>
                <CardTitle>Normen formulieren</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted">
                  Formuliere eine Norm und beziehe dich dabei auf einen Wert aus dem
                  Wertekatalog.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">Wert aus dem Wertekatalog</label>
                  <select
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring"
                    value={selectedNormValueId}
                    onChange={(event) => setSelectedNormValueId(event.target.value)}
                  >
                    <option value="">Bitte auswaehlen</option>
                    {catalogValueLabels.map((label) => {
                      const valueId = valueIdByLabel[label];
                      if (!valueId) return null;
                      return (
                        <option key={valueId} value={valueId}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">Norm</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Formuliere eine Norm..."
                    value={normText}
                    onChange={(event) => setNormText(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleNormSubmit} disabled={normSaving}>
                    Norm speichern
                  </Button>
                  <Button
                    onClick={() => handleReadyToggle(!isReady)}
                    variant={isReady ? "outline" : "primary"}
                  >
                    {isReady ? "Nicht bereit" : "Bereit melden"}
                  </Button>
                </div>
                {normError && <p className="text-sm text-accent2">{normError}</p>}
                {statusMessage && <p className="text-sm text-muted">{statusMessage}</p>}
                {readyUpdatedAt && (
                  <p className="text-xs text-muted">
                    Status zuletzt geaendert:{" "}
                    {new Date(readyUpdatedAt).toLocaleString("de-DE")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {isReviewMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Meine Normen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted">
                  {userNorms.length > 0 ? (
                    userNorms.map((norm) => (
                      <div key={norm.id} className="space-y-1">
                        <p className="text-ink">{norm.norm}</p>
                        <p className="text-xs text-muted">
                          Bezug: {valueLabelById[norm.basedOnValueId] ?? "Unbekannt"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>Noch keine Normen erfasst.</p>
                  )}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Werterahmen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted">
                {catalogValueLabels.length > 0 ? (
                  catalogValueLabels.map((label) => (
                    <div key={label} className="flex items-center justify-between">
                      <span>{label}</span>
                    </div>
                  ))
                ) : (
                  <p>Noch kein Wertekatalog festgelegt.</p>
                )}
              </CardContent>
            </Card>


            {isHost && currentStep !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Leitung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted">
                  <HostControls
                    code={code}
                    name={name}
                    initialStep={currentStep}
                    settings={settings}
                  />
                  {adminParticipants.length > 0 && (
                    <div className="space-y-2">
                      {adminParticipants.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3 py-2"
                        >
                          <span className="text-ink">{item.user?.name ?? "Unbekannt"}</span>
                          <span className="text-xs text-muted">
                            {item.continueButton ? "bereit" : "nicht bereit"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isHost && Object.keys(adminNormsByUser).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Normen der Teilnehmenden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted">
                  {Object.entries(adminNormsByUser).map(([userIdKey, norms]) => (
                    <div key={userIdKey} className="space-y-2">
                      <p className="font-medium text-ink">
                        {participantNameByUserId[userIdKey] ?? "Unbekannt"}
                      </p>
                      <div className="space-y-2">
                        {norms.map((norm) => (
                          <div
                            key={norm.id}
                            className="rounded-xl border border-border bg-bg px-3 py-2"
                          >
                            <p className="text-ink">{norm.norm}</p>
                            <p className="text-xs text-muted">
                              Bezug: {valueLabelById[norm.basedOnValueId] ?? "Unbekannt"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : step === 4 ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Oberthema der Diskussion</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                {discussionTheme ? (
                  <p className="text-ink">{discussionTheme}</p>
                ) : (
                  <p>Noch kein Thema hinterlegt.</p>
                )}
              </CardContent>
            </Card>
            {!isHost && !isReviewMode && !currentDiscussionPointId && (
              <Card>
                <CardHeader>
                  <CardTitle>Fragen sammeln</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionsForm
                    maxQuestions={questionsCount}
                    onSubmit={handleQuestionsSubmit}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleReadyToggle(!isReady)}
                      variant={isReady ? "outline" : "primary"}
                    >
                      {isReady ? "Nicht bereit" : "Bereit melden"}
                    </Button>
                  </div>
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
            {!isHost && currentDiscussionPointId && (
              <Card>
                <CardHeader>
                  <CardTitle>Aktuelle Frage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-ink">
                    {activeDiscussionPoint?.discussionPoint ?? "Frage wird geladen..."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleSkipToggle(!hasSkipped)}
                      variant={hasSkipped ? "outline" : "primary"}
                      disabled={discussionActionLoading}
                    >
                      {hasSkipped ? "Weiter diskutieren" : "Frage ueberspringen"}
                    </Button>
                  </div>
                  {discussionActionError && (
                    <p className="text-xs text-accent2">{discussionActionError}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-4">
            {!isHost && (
              <Card>
                <CardHeader>
                  <CardTitle>Meine Fragen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted">
                  {userQuestions.length > 0 ? (
                    userQuestions.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-bg px-3 py-2"
                      >
                        <p className="text-ink">{item.discussionPoint}</p>
                      </div>
                    ))
                  ) : (
                    <p>Noch keine Fragen erfasst.</p>
                  )}
                </CardContent>
              </Card>
            )}
            {isHost && (
              <Card>
                <CardHeader>
                  <CardTitle>Fragen der Teilnehmenden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted">
                  {discussionPoints.length > 0 ? (
                    discussionPoints.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-bg px-3 py-2"
                      >
                        <p className="text-ink">{item.discussionPoint}</p>
                        <p className="text-xs text-muted">
                          {participantNameByUserId[item.writtenByUserId] ?? "Unbekannt"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>Noch keine Fragen erfasst.</p>
                  )}
                </CardContent>
              </Card>
            )}
            {isHost && (
              <Card>
                <CardHeader>
                  <CardTitle>Diskussion steuern</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted">
                  {currentDiscussionPointId ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted">Aktuelle Frage</p>
                        <p className="text-ink">
                          {activeDiscussionPoint?.discussionPoint ?? "Frage wird geladen..."}
                        </p>
                      </div>
                      <p className="text-xs text-muted">
                        Ueberspringen-Stimmen: {skipVotes} / {adminParticipants.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handleCompleteDiscussionPoint}
                          disabled={discussionActionLoading}
                        >
                          Frage beenden
                        </Button>
                        <Button
                          onClick={handleFinishDiscussion}
                          variant="outline"
                          disabled={discussionActionLoading}
                        >
                          Diskussion beenden
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted">
                        Waehle eine Frage aus dem Pool aus, um die Diskussion zu starten.
                      </p>
                      <div className="space-y-2">
                        {openDiscussionPoints.length > 0 ? (
                          openDiscussionPoints.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3 py-2"
                            >
                              <span className="text-ink">{item.discussionPoint}</span>
                              <Button
                                size="sm"
                                onClick={() => handleStartDiscussionPoint(item.id)}
                                disabled={discussionActionLoading}
                              >
                                Frage starten
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p>Noch keine offenen Fragen verfuegbar.</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handleFinishDiscussion}
                          variant="outline"
                          disabled={discussionActionLoading}
                        >
                          Diskussion beenden
                        </Button>
                      </div>
                    </div>
                  )}
                  {discussionActionError && (
                    <p className="text-xs text-accent2">{discussionActionError}</p>
                  )}
                </CardContent>
              </Card>
            )}
            {isHost && currentStep !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Leitung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted">
                  <HostControls
                    code={code}
                    name={name}
                    initialStep={currentStep}
                    settings={settings}
                  />
                  {adminParticipants.length > 0 && (
                    <div className="space-y-2">
                      {adminParticipants.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3 py-2"
                        >
                          <span className="text-ink">{item.user?.name ?? "Unbekannt"}</span>
                          <span className="text-xs text-muted">
                            {item.continueButton ? "bereit" : "nicht bereit"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Deine Antwort</CardTitle>
          </CardHeader>
          <CardContent>
            <StepForm
              prompt={stepPrompt}
              helper={stepData.helper}
              onSubmit={handleStepSubmit}
            />
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
