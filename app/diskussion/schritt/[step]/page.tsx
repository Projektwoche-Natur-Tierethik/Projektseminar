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

const begriffsklaerungInklusionsproblem = {
  leitfrage: "Wer hat moralischen Selbstwert?",
  einordnung:
    "Eine der zentralen Fragestellungen der Umwelt- und Tierethik ist die Bestimmung derjenigen Wesen, die um ihrer selbst willen moralisch zu berücksichtigen sind. Diese erheben den Anspruch, nicht rein als Mittel für beliebige Zwecke missbraucht zu werden.",
  antworten: [
    {
      id: "sentientismus",
      title: "Sentientismus",
      summary:
        "Beim Sentientismus, auch Pathozentrismus genannt, ist die Fähigkeit zu fühlen und zu leiden entscheidend. Moralischer Selbstwert gilt also für empfindungsfähige Wesen",
      focus: "Kriterium: Empfindungsfähigkeit (Sentienz)"
    },
    {
      id: "biozentrik",
      title: "Biozentrik",
      summary: "Alles Lebendige besitzt Eigenwert, nicht nur empfindungsfähige Individuen.",
      focus: "Kriterium: Leben als solches"
    },
    {
      id: "oekozentrismus",
      title: "Ökozentrismus",
      summary: "Moralischer Selbstwert liegt bei Ökosystemen, Arten und Gemeinschaften als Ganzem.",
      focus: "Kriterium: Integrität und Stabilität von Ökosystemen"
    },
    {
      id: "pluralistischer-holismus",
      title: "Pluralistischer Holismus",
      summary:
        "Mehrere Ebenen haben Eigenwert: Individuen, Arten und Ökosysteme. Niemand wird aus der moralischen Gemeinschaft ausgeschlossen.",
      focus: "Kriterium: Keines"
    }
  ]
};

export default function DiscussionStepPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = Number(params.step);
  const canEditConclusion = step === 5 || step === 6;
  const code = searchParams.get("code") ?? "";
  const name = (searchParams.get("name") ?? "").trim();

  function hashString(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function seededShuffle<T>(items: T[], seed: number) {
    const result = [...items];
    let current = result.length;
    let state = seed || 1;
    while (current) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const index = state % current;
      current -= 1;
      [result[current], result[index]] = [result[index], result[current]];
    }
    return result;
  }

  function createValuesSignature(values: string[]) {
    return [...values].sort((left, right) => left.localeCompare(right, "de-DE")).join("||");
  }

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
  const [participantMainConclusion, setParticipantMainConclusion] = useState<string | null>(null);
  const [inclusionDraft, setInclusionDraft] = useState("");
  const [inclusionSaving, setInclusionSaving] = useState(false);
  const [inclusionError, setInclusionError] = useState("");
  const [participantsWithUser, setParticipantsWithUser] = useState<any[]>([]);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [discussionActionError, setDiscussionActionError] = useState("");
  const [discussionActionLoading, setDiscussionActionLoading] = useState(false);
  const [conclusionsByPoint, setConclusionsByPoint] = useState<Record<string, any[]>>({});
  const [commentsByConclusion, setCommentsByConclusion] = useState<Record<string, any[]>>({});
  const [userDirectory, setUserDirectory] = useState<Record<string, any>>({});
  const [conclusionDrafts, setConclusionDrafts] = useState<Record<string, string>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [conclusionLikeCounts, setConclusionLikeCounts] = useState<Record<string, number>>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<Record<string, number>>({});
  const [conclusionLikedByUser, setConclusionLikedByUser] = useState<Record<string, boolean>>({});
  const [commentLikedByUser, setCommentLikedByUser] = useState<Record<string, boolean>>({});
  const [discussionPointLikeCounts, setDiscussionPointLikeCounts] = useState<Record<string, number>>(
    {}
  );
  const [discussionPointLikedByUser, setDiscussionPointLikedByUser] = useState<
    Record<string, boolean>
  >({});
  const [fazitError, setFazitError] = useState("");
  const [showAllGroupNorms, setShowAllGroupNorms] = useState(false);
  const currentPointRef = useRef<string | null>(null);
  const lastSavedValuesSignatureRef = useRef("");
  const savingValuesRef = useRef(false);
  const valuesCount = settings.valuesCount;
  const questionsCount = settings.questionsCount;
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
    const directoryFromParticipants = [...participantsWithUser, ...adminParticipants].reduce(
      (acc: Record<string, string>, item: any) => {
        if (item?.userId && item?.user?.name) {
          acc[String(item.userId)] = String(item.user.name);
        }
        return acc;
      },
      {}
    );
    const directoryFromUsers = Object.entries(userDirectory).reduce(
      (acc: Record<string, string>, [id, user]) => {
        if (user?.name) {
          acc[id] = String(user.name);
        }
        return acc;
      },
      {}
    );
    return { ...directoryFromParticipants, ...directoryFromUsers };
  }, [participantsWithUser, adminParticipants, userDirectory]);
  const adminNormsByUser = useMemo(() => {
    return adminNorms.reduce((acc: Record<string, any[]>, norm: any) => {
      const key = norm.userId ?? "unbekannt";
      if (!acc[key]) acc[key] = [];
      acc[key].push(norm);
      return acc;
    }, {});
  }, [adminNorms]);
  const sortedGroupNorms = useMemo(() => {
    return [...adminNorms].sort((left, right) => {
      return String(left?.norm ?? "").localeCompare(String(right?.norm ?? ""), "de-DE");
    });
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
  const zeroVoteValues = useMemo(() => {
    const valuesWithVotes = new Set(topValues.map((item) => item.value));
    return valuesList
      .filter((label) => !valuesWithVotes.has(label))
      .sort((left, right) => left.localeCompare(right, "de-DE"));
  }, [topValues]);
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
  const isReviewMode =
    !isHost && currentEnabledStep !== null && currentEnabledStep > step;
  const nextEnabledStep = useMemo(
    () => enabledSteps.find((item) => item > step) ?? null,
    [enabledSteps, step]
  );
  const shuffleSeed = useMemo(() => {
    return hashString(userId ?? name ?? String(code));
  }, [userId, name, code]);
  const shuffledValuesList = useMemo(() => {
    return seededShuffle(valuesList, shuffleSeed);
  }, [shuffleSeed]);

  useEffect(() => {
    if (!code || (step !== 1 && step !== 2)) return;
    let isMounted = true;
    const fetchTopValues = () => {
      fetch(`/api/diskussion/werte?code=${code}&t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          setTopValues(data.topValues ?? []);
        })
        .catch(() => {
          if (!isMounted) return;
          setTopValues([]);
        });
    };

    fetchTopValues();
    const interval = window.setInterval(fetchTopValues, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
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
    if (!discussionId || !userId || step !== 3) return;
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
    if (!discussionId || !userId || (step !== 1 && step !== 2)) return;
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
    if (step !== 1 && step !== 2) return;
    const valuesFromIds = userValueIds
      .map((valueId) => valueLabelById[valueId])
      .filter(Boolean);
    setSelectedValues(valuesFromIds);
    lastSavedValuesSignatureRef.current = createValuesSignature(valuesFromIds);
  }, [step, userValueIds, valueLabelById]);

  useEffect(() => {
    if (!discussionId || !userId || step !== 5) return;
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
    if (!discussionId || step < 3) return;
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
  }, [discussionId, step]);

  useEffect(() => {
    if (!discussionId || (step !== 5 && step !== 6)) return;
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
    if (!discussionId || step !== 5) return;
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
    if (!discussionId || (step !== 5 && step !== 6)) return;
    let isMounted = true;
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const directory = (data.users ?? []).reduce((acc: Record<string, any>, user: any) => {
          if (user?.id) {
            acc[user.id] = user;
          }
          return acc;
        }, {});
        setUserDirectory(directory);
      })
      .catch(() => {
        if (!isMounted) return;
        setUserDirectory({});
      });
    return () => {
      isMounted = false;
    };
  }, [discussionId, step]);

  useEffect(() => {
    if (!discussionId || (step !== 5 && step !== 6)) return;
    let isMounted = true;
    const fetchConclusions = async () => {
      const completed = discussionPoints.filter((item) => item.markedAsComplete);
      const currentPoint =
        step === 5 && currentDiscussionPointId
          ? discussionPoints.find((item) => item.id === currentDiscussionPointId)
          : null;
      const relevantPoints = currentPoint ? [currentPoint, ...completed] : completed;
      const uniquePoints = relevantPoints.filter(
        (item, index, array) => array.findIndex((entry) => entry.id === item.id) === index
      );
      if (uniquePoints.length === 0) {
        if (!isMounted) return;
        setConclusionsByPoint({});
        return;
      }
      try {
        const entries = await Promise.all(
          uniquePoints.map(async (item) => {
            const response = await fetch(
              `/api/discussionpoint-conclusions?discussionPointId=${encodeURIComponent(
                item.id
              )}`
            );
            const data = await response.json();
            return [item.id, Array.isArray(data.conclusions) ? data.conclusions : []] as const;
          })
        );
        if (!isMounted) return;
        const next = entries.reduce((acc: Record<string, any[]>, [id, conclusions]) => {
          acc[id] = conclusions;
          return acc;
        }, {});
        setConclusionsByPoint(next);
      } catch {
        if (!isMounted) return;
        setConclusionsByPoint({});
      }
    };
    fetchConclusions();
    const interval = window.setInterval(fetchConclusions, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, discussionPoints, step, currentDiscussionPointId]);

  useEffect(() => {
    if ((step !== 5 && step !== 6) || !userId) return;
    const updates: Record<string, string> = {};
    Object.entries(conclusionsByPoint).forEach(([pointId, conclusions]) => {
      const own = (conclusions as any[]).find((item) => item.userId === userId);
      if (own) {
        updates[pointId] = own.conclusion ?? "";
      }
    });
    if (Object.keys(updates).length > 0) {
      setConclusionDrafts((prev) => {
        const next = { ...prev };
        Object.entries(updates).forEach(([pointId, value]) => {
          if (!(pointId in next)) {
            next[pointId] = value;
          }
        });
        return next;
      });
    }
  }, [step, userId, conclusionsByPoint]);

  useEffect(() => {
    if (!discussionId || (step !== 5 && step !== 6)) return;
    let isMounted = true;
    const fetchComments = async () => {
      const allConclusions = Object.values(conclusionsByPoint).flat();
      if (allConclusions.length === 0) {
        if (!isMounted) return;
        setCommentsByConclusion({});
        return;
      }
      try {
        const entries = await Promise.all(
          allConclusions.map(async (conclusion) => {
            const response = await fetch(
              `/api/comment-on-conclusion-discussionpoints?discussionPointConclusionId=${encodeURIComponent(
                conclusion.id
              )}`
            );
            const data = await response.json();
            const links = Array.isArray(data.links) ? data.links : [];
            const comments = await Promise.all(
              links.map(async (link: any) => {
                const commentResponse = await fetch(
                  `/api/comments?commentId=${encodeURIComponent(link.commentId)}`
                );
                const commentData = await commentResponse.json();
                return Array.isArray(commentData.comments) ? commentData.comments[0] : null;
              })
            );
            return [conclusion.id, comments.filter(Boolean)] as const;
          })
        );
        if (!isMounted) return;
        const next = entries.reduce((acc: Record<string, any[]>, [id, comments]) => {
          acc[id] = comments;
          return acc;
        }, {});
        setCommentsByConclusion(next);
      } catch {
        if (!isMounted) return;
        setCommentsByConclusion({});
      }
    };
    fetchComments();
    const interval = window.setInterval(fetchComments, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, conclusionsByPoint, step]);

  useEffect(() => {
    if (!discussionId || (step !== 5 && step !== 6)) return;
    let isMounted = true;
    const fetchConclusionLikes = async () => {
      const allConclusions = Object.values(conclusionsByPoint).flat();
      if (allConclusions.length === 0) {
        if (!isMounted) return;
        setConclusionLikeCounts({});
        setConclusionLikedByUser({});
        return;
      }
      try {
        const entries = await Promise.all(
          allConclusions.map(async (conclusion) => {
            const query = new URLSearchParams({
              discussionPointId: conclusion.discussionPointId,
              conclusionUserId: conclusion.userId,
              ...(userId ? { likerUserId: userId } : {})
            });
            const response = await fetch(
              `/api/discussionpoint-conclusion-likes?${query.toString()}`
            );
            const data = await response.json();
            return [
              conclusion.id,
              {
                count: Number(data.count ?? 0),
                liked: Boolean(data.liked)
              }
            ] as const;
          })
        );
        if (!isMounted) return;
        const nextCounts = entries.reduce((acc: Record<string, number>, [id, payload]) => {
          acc[id] = payload.count;
          return acc;
        }, {});
        const nextLiked = entries.reduce((acc: Record<string, boolean>, [id, payload]) => {
          acc[id] = payload.liked;
          return acc;
        }, {});
        setConclusionLikeCounts(nextCounts);
        setConclusionLikedByUser(nextLiked);
      } catch {
        if (!isMounted) return;
        setConclusionLikeCounts({});
        setConclusionLikedByUser({});
      }
    };
    fetchConclusionLikes();
    const interval = window.setInterval(fetchConclusionLikes, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, conclusionsByPoint, step, userId]);

  useEffect(() => {
    if (!discussionId || (step !== 5 && step !== 6)) return;
    let isMounted = true;
    const fetchCommentLikes = async () => {
      const allComments = Object.values(commentsByConclusion).flat();
      if (allComments.length === 0) {
        if (!isMounted) return;
        setCommentLikeCounts({});
        setCommentLikedByUser({});
        return;
      }
      try {
        const entries = await Promise.all(
          allComments.map(async (comment) => {
            const query = new URLSearchParams({
              commentId: comment.id,
              ...(userId ? { likerUserId: userId } : {})
            });
            const response = await fetch(`/api/comment-likes?${query.toString()}`);
            const data = await response.json();
            return [
              comment.id,
              {
                count: Number(data.count ?? 0),
                liked: Boolean(data.liked)
              }
            ] as const;
          })
        );
        if (!isMounted) return;
        const nextCounts = entries.reduce((acc: Record<string, number>, [id, payload]) => {
          acc[id] = payload.count;
          return acc;
        }, {});
        const nextLiked = entries.reduce((acc: Record<string, boolean>, [id, payload]) => {
          acc[id] = payload.liked;
          return acc;
        }, {});
        setCommentLikeCounts(nextCounts);
        setCommentLikedByUser(nextLiked);
      } catch {
        if (!isMounted) return;
        setCommentLikeCounts({});
        setCommentLikedByUser({});
      }
    };
    fetchCommentLikes();
    const interval = window.setInterval(fetchCommentLikes, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, commentsByConclusion, step, userId]);

  useEffect(() => {
    if (step !== 5) return;
    let isMounted = true;
    const fetchPointLikes = async () => {
      if (discussionPoints.length === 0) {
        if (!isMounted) return;
        setDiscussionPointLikeCounts({});
        setDiscussionPointLikedByUser({});
        return;
      }
      try {
        const entries = await Promise.all(
          discussionPoints.map(async (point) => {
            const query = new URLSearchParams({
              discussionPointId: point.id,
              ...(userId ? { likerUserId: userId } : {})
            });
            const response = await fetch(`/api/discussionpoint-likes?${query.toString()}`);
            const data = await response.json();
            return [
              point.id,
              {
                count: Number(data.count ?? 0),
                liked: Boolean(data.liked)
              }
            ] as const;
          })
        );
        if (!isMounted) return;
        const nextCounts = entries.reduce((acc: Record<string, number>, [id, payload]) => {
          acc[id] = payload.count;
          return acc;
        }, {});
        const nextLiked = entries.reduce((acc: Record<string, boolean>, [id, payload]) => {
          acc[id] = payload.liked;
          return acc;
        }, {});
        setDiscussionPointLikeCounts(nextCounts);
        setDiscussionPointLikedByUser(nextLiked);
      } catch {
        if (!isMounted) return;
        setDiscussionPointLikeCounts({});
        setDiscussionPointLikedByUser({});
      }
    };
    fetchPointLikes();
    const interval = window.setInterval(fetchPointLikes, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionPoints, step, userId]);

  useEffect(() => {
    if (!discussionId || !userId || step !== 5) return;
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
        const mainConclusion = participant?.mainConclusion ?? null;
        setParticipantMainConclusion(mainConclusion);
        setInclusionDraft(mainConclusion ?? "");
      })
      .catch(() => {
        if (!isMounted) return;
        setParticipantId(null);
        setParticipantMainConclusion(null);
        setInclusionDraft("");
      });
    return () => {
      isMounted = false;
    };
  }, [discussionId, userId, step]);

  useEffect(() => {
    if (!discussionId || step < 4) return;
    if (step !== 4 && !settings.normsEnabled) return;
    let isMounted = true;
    const fetchParticipants = () => {
      fetch(
        `/api/participants?discussionId=${encodeURIComponent(discussionId)}&includeUser=true`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const participants = Array.isArray(data.participants) ? data.participants : [];
          setParticipantsWithUser(participants.filter((item: any) => !item.admin));
        })
        .catch(() => {
          if (!isMounted) return;
          setParticipantsWithUser([]);
        });
    };
    fetchParticipants();
    const interval = window.setInterval(fetchParticipants, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [discussionId, settings.normsEnabled, step]);

  useEffect(() => {
    if (step !== 5) return;
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

  useEffect(() => {
    if (isHost || currentEnabledStep === null || currentEnabledStep <= step) return;
    if (currentEnabledStep >= 1 && currentEnabledStep <= 6) {
      router.push(`/diskussion/schritt/${currentEnabledStep}?code=${code}&name=${encodeURIComponent(name)}`);
      return;
    }
    if (currentEnabledStep > 6) {
      router.push(`/diskussion/schritt/6?code=${code}&name=${encodeURIComponent(name)}`);
    }
  }, [isHost, currentEnabledStep, step, code, name, router]);

  useEffect(() => {
    if (step !== 1 || isHost || isReviewMode || !code || !name) return;
    const nextSignature = createValuesSignature(selectedValues);
    if (nextSignature === lastSavedValuesSignatureRef.current) return;

    const timeout = window.setTimeout(() => {
      if (savingValuesRef.current) return;
      savingValuesRef.current = true;
      setLoading(true);
      fetch("/api/diskussion/werte", {
        method: "POST",
        body: JSON.stringify({ code, name, values: selectedValues }),
        headers: { "Content-Type": "application/json" }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("save_failed");
          }
          lastSavedValuesSignatureRef.current = nextSignature;
        })
        .catch(() => {
          setStatusMessage("Werte konnten nicht gespeichert werden.");
        })
        .finally(() => {
          savingValuesRef.current = false;
          setLoading(false);
        });
    }, 10000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [step, isHost, isReviewMode, code, name, selectedValues]);

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
            Zum nächsten aktiven Schritt
          </Link>
        ) : (
          <Link
            href={`/diskussion/lobby/${code}?name=${encodeURIComponent(name)}`}
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Zurück zur Lobby
          </Link>
        )}
      </div>
    );
  }

  async function persistSelectedValues(force = false) {
    if (step !== 1 || isHost || !code || !name) return true;
    const nextSignature = createValuesSignature(selectedValues);

    if (!force && nextSignature === lastSavedValuesSignatureRef.current) {
      return true;
    }
    if (savingValuesRef.current) {
      return false;
    }

    savingValuesRef.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/diskussion/werte", {
        method: "POST",
        body: JSON.stringify({ code, name, values: selectedValues }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("save_failed");
      }
      lastSavedValuesSignatureRef.current = nextSignature;
      return true;
    } catch {
      setStatusMessage("Werte konnten nicht gespeichert werden.");
      return false;
    } finally {
      savingValuesRef.current = false;
      setLoading(false);
    }
  }

  async function handleStepSubmit(value: string) {
    setStatusMessage("");
    await fetch("/api/diskussion/step", {
      method: "POST",
      body: JSON.stringify({ code, name, step, response: value }),
      headers: { "Content-Type": "application/json" }
    });

    setStatusMessage("Antwort gespeichert. Warte auf die Freigabe des nächsten Schritts.");
  }

  async function handleQuestionsSubmit(questions: string[]) {
    const remainingQuestions = Math.max(questionsCount - userQuestions.length, 0);
    if (remainingQuestions <= 0) {
      setStatusMessage("Du hast bereits die maximale Anzahl an Fragen eingereicht.");
      return;
    }
    if (questions.length > remainingQuestions) {
      setStatusMessage(`Bitte maximal ${remainingQuestions} weitere Fragen einreichen.`);
      return;
    }
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
      setStatusMessage("Fragen gespeichert. Warte auf die Freigabe des nächsten Schritts.");
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
      setSelectedNormValueId("");
      setStatusMessage("Norm gespeichert. Warte auf die Freigabe des nächsten Schritts.");
    } catch {
      setNormError("Norm konnte nicht gespeichert werden.");
    } finally {
      setNormSaving(false);
    }
  }

  async function handleInclusionSubmit() {
    if (!participantId) {
      setInclusionError("Antwort konnte nicht gespeichert werden.");
      return;
    }
    const text = inclusionDraft.trim();
    if (!text) {
      setInclusionError("Bitte eine Begründung eingeben.");
      return;
    }
    setInclusionSaving(true);
    setInclusionError("");
    try {
      const response = await fetch("/api/participants", {
        method: "PUT",
        body: JSON.stringify({ participantId, mainConclusion: text }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("inclusion_failed");
      }
      const data = await response.json();
      const saved = data?.participant?.mainConclusion ?? text;
      setParticipantMainConclusion(saved);
      setInclusionDraft(saved);
      setStatusMessage("Antwort gespeichert. Warte auf die Freigabe des nächsten Schritts.");
    } catch {
      setInclusionError("Antwort konnte nicht gespeichert werden.");
    } finally {
      setInclusionSaving(false);
    }
  }

  async function handleFrameToggle(label: string, nextValue: boolean) {
    if (!discussionId || !adminUserId) return;
    const valueId = valueIdByLabel[label];
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
      setAdminError("Werterahmen konnte nicht gespeichert werden.");
    }
  }

  async function handleReadyToggle(nextReady: boolean) {
    setStatusMessage("");
    if (step === 1 && !isHost && nextReady) {
      const saved = await persistSelectedValues(true);
      if (!saved) {
        setStatusMessage("Bitte versuche es erneut. Die Werte konnten nicht gespeichert werden.");
        return;
      }
    }

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

  async function handlePublishDiscussion() {
    if (!code || !name || !isHost) return;
    setDiscussionActionLoading(true);
    setDiscussionActionError("");
    try {
      const response = await fetch("/api/diskussion/control", {
        method: "POST",
        body: JSON.stringify({ code, name, action: "finish" }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("publish_failed");
      }
      setStatusMessage("Diskussion veröffentlicht.");
    } catch {
      setDiscussionActionError("Diskussion konnte nicht veröffentlicht werden.");
    } finally {
      setDiscussionActionLoading(false);
    }
  }

  function handleHostStepChange(nextStep: number) {
    setCurrentStep(nextStep);
    if (nextStep >= 1 && nextStep <= 6 && nextStep !== step) {
      router.push(`/diskussion/schritt/${nextStep}?code=${code}&name=${encodeURIComponent(name)}`);
      return;
    }
    if (nextStep > 6) {
      router.push(`/diskussion/schritt/6?code=${code}&name=${encodeURIComponent(name)}`);
    }
  }

  async function handleConclusionSubmit(pointId: string) {
    if (!userId) return;
    const text = (conclusionDrafts[pointId] ?? "").trim();
    if (!text) {
      setFazitError("Bitte ein Fazit eingeben.");
      return;
    }
    setFazitError("");
    try {
      const response = await fetch("/api/discussionpoint-conclusions", {
        method: "POST",
        body: JSON.stringify({ discussionPointId: pointId, userId, conclusion: text }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("conclusion_failed");
      }
      const data = await response.json();
      const created = data.conclusion;
      setConclusionsByPoint((prev) => ({
        ...prev,
        [pointId]: [...(prev[pointId] ?? []), created]
      }));
      setConclusionDrafts((prev) => ({ ...prev, [pointId]: "" }));
    } catch {
      setFazitError("Fazit konnte nicht gespeichert werden.");
    }
  }

  async function handleConclusionUpdate(conclusionId: string, pointId: string) {
    const text = (conclusionDrafts[pointId] ?? "").trim();
    if (!text) {
      setFazitError("Bitte ein Fazit eingeben.");
      return;
    }
    setFazitError("");
    try {
      const response = await fetch("/api/discussionpoint-conclusions", {
        method: "PUT",
        body: JSON.stringify({ conclusionId, conclusion: text }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("conclusion_update_failed");
      }
      const data = await response.json();
      const updated = data.conclusion;
      setConclusionsByPoint((prev) => ({
        ...prev,
        [pointId]: (prev[pointId] ?? []).map((item) =>
          item.id === conclusionId ? updated : item
        )
      }));
      setConclusionDrafts((prev) => ({ ...prev, [pointId]: updated.conclusion ?? text }));
    } catch {
      setFazitError("Fazit konnte nicht aktualisiert werden.");
    }
  }

  async function handleCommentSubmit(conclusionId: string) {
    if (!userId) return;
    const text = (commentDrafts[conclusionId] ?? "").trim();
    if (!text) {
      setFazitError("Bitte einen Kommentar eingeben.");
      return;
    }
    setFazitError("");
    try {
      const commentResponse = await fetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({ writtenByUserId: userId, comment: text }),
        headers: { "Content-Type": "application/json" }
      });
      if (!commentResponse.ok) {
        throw new Error("comment_failed");
      }
      const commentData = await commentResponse.json();
      const comment = commentData.comment;
      const linkResponse = await fetch("/api/comment-on-conclusion-discussionpoints", {
        method: "POST",
        body: JSON.stringify({
          commentId: comment.id,
          discussionPointConclusionId: conclusionId
        }),
        headers: { "Content-Type": "application/json" }
      });
      if (!linkResponse.ok) {
        throw new Error("link_failed");
      }
      setCommentsByConclusion((prev) => ({
        ...prev,
        [conclusionId]: [...(prev[conclusionId] ?? []), comment]
      }));
      setCommentLikeCounts((prev) => ({ ...prev, [comment.id]: prev[comment.id] ?? 0 }));
      setCommentDrafts((prev) => ({ ...prev, [conclusionId]: "" }));
    } catch {
      setFazitError("Kommentar konnte nicht gespeichert werden.");
    }
  }

  async function handleDiscussionPointLikeToggle(point: any) {
    if (!userId) return;
    setDiscussionActionError("");
    const liked = Boolean(discussionPointLikedByUser[point.id]);
    try {
      if (liked) {
        const response = await fetch("/api/discussionpoint-likes", {
          method: "DELETE",
          body: JSON.stringify({ likerUserId: userId, discussionPointId: point.id }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("unlike_failed");
        }
        setDiscussionPointLikedByUser((prev) => ({ ...prev, [point.id]: false }));
        setDiscussionPointLikeCounts((prev) => ({
          ...prev,
          [point.id]: Math.max((prev[point.id] ?? 1) - 1, 0)
        }));
      } else {
        const response = await fetch("/api/discussionpoint-likes", {
          method: "PUT",
          body: JSON.stringify({ likerUserId: userId, discussionPointId: point.id }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("like_failed");
        }
        setDiscussionPointLikedByUser((prev) => ({ ...prev, [point.id]: true }));
        setDiscussionPointLikeCounts((prev) => ({
          ...prev,
          [point.id]: (prev[point.id] ?? 0) + 1
        }));
      }
    } catch {
      setDiscussionActionError("Zustimmung konnte nicht gespeichert werden.");
    }
  }

  async function handleConclusionLikeToggle(conclusion: any) {
    if (!userId) return;
    setFazitError("");
    const liked = Boolean(conclusionLikedByUser[conclusion.id]);
    try {
      if (liked) {
        const response = await fetch("/api/discussionpoint-conclusion-likes", {
          method: "DELETE",
          body: JSON.stringify({
            likerUserId: userId,
            dpConclusionId: conclusion.id,
            conclusionWrittenByUserId: conclusion.userId
          }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("unlike_failed");
        }
        setConclusionLikedByUser((prev) => ({ ...prev, [conclusion.id]: false }));
        setConclusionLikeCounts((prev) => ({
          ...prev,
          [conclusion.id]: Math.max((prev[conclusion.id] ?? 1) - 1, 0)
        }));
      } else {
        const response = await fetch("/api/discussionpoint-conclusion-likes", {
          method: "POST",
          body: JSON.stringify({
            likerUserId: userId,
            dpConclusionId: conclusion.id,
            conclusionWrittenByUserId: conclusion.userId
          }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("like_failed");
        }
        setConclusionLikedByUser((prev) => ({ ...prev, [conclusion.id]: true }));
        setConclusionLikeCounts((prev) => ({
          ...prev,
          [conclusion.id]: (prev[conclusion.id] ?? 0) + 1
        }));
      }
    } catch {
      setFazitError("Zustimmung konnte nicht gespeichert werden.");
    }
  }

  async function handleCommentLikeToggle(comment: any) {
    if (!userId) return;
    setFazitError("");
    const liked = Boolean(commentLikedByUser[comment.id]);
    try {
      if (liked) {
        const response = await fetch("/api/comment-likes", {
          method: "DELETE",
          body: JSON.stringify({ likerUserId: userId, commentId: comment.id }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("unlike_failed");
        }
        setCommentLikedByUser((prev) => ({ ...prev, [comment.id]: false }));
        setCommentLikeCounts((prev) => ({
          ...prev,
          [comment.id]: Math.max((prev[comment.id] ?? 1) - 1, 0)
        }));
      } else {
        const response = await fetch("/api/comment-likes", {
          method: "POST",
          body: JSON.stringify({ likerUserId: userId, commentId: comment.id }),
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("like_failed");
        }
        setCommentLikedByUser((prev) => ({ ...prev, [comment.id]: true }));
        setCommentLikeCounts((prev) => ({
          ...prev,
          [comment.id]: (prev[comment.id] ?? 0) + 1
        }));
      }
    } catch {
      setFazitError("Zustimmung konnte nicht gespeichert werden.");
    }
  }

  if (!name) {
    return (
      <div className="container mx-auto pt-12">
        <p className="text-muted">
          Bitte zuerst über die Lobby oder Join-Seite beitreten.
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
            Zurück zur Lobby
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

    if (currentStep !== null && currentStep > 6) {
      return (
        <div className="container mx-auto space-y-4 pt-12">
          <p className="text-muted">
            Die Diskussion ist abgeschlossen. Das Fazit ist verfügbar.
          </p>
          <Link
            href={`/diskussion/schritt/6?code=${code}&name=${encodeURIComponent(name)}`}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Zum Fazit
          </Link>
        </div>
      );
    }
  }

  const stepPrompt =
    step === 5
      ? `Thema der Diskussion: ${discussionTheme ? discussionTheme : "—"}`
      : stepData.prompt;

  const activeDiscussionPoint = discussionPoints.find(
    (item) => item.id === currentDiscussionPointId
  );
  const openDiscussionPoints = discussionPoints.filter((item) => !item.markedAsComplete);
  const completedDiscussionPoints = discussionPoints.filter((item) => item.markedAsComplete);
  const skipVotes = adminParticipants.filter((item) => item.moveOnButton).length;
  const remainingQuestions = Math.max(questionsCount - userQuestions.length, 0);
  const discussionPointsForConclusions = [
    ...(currentDiscussionPointId && activeDiscussionPoint ? [activeDiscussionPoint] : []),
    ...completedDiscussionPoints
  ].filter(
    (item, index, array) => array.findIndex((entry) => entry.id === item.id) === index
  );
  const sortedOpenDiscussionPoints = [...openDiscussionPoints].sort((left, right) => {
    const diff =
      (discussionPointLikeCounts[right.id] ?? 0) -
      (discussionPointLikeCounts[left.id] ?? 0);
    if (diff !== 0) return diff;
    return left.discussionPoint.localeCompare(right.discussionPoint, "de-DE");
  });
  const sortedCompletedDiscussionPoints = [...completedDiscussionPoints].sort((left, right) => {
    const diff =
      (discussionPointLikeCounts[right.id] ?? 0) -
      (discussionPointLikeCounts[left.id] ?? 0);
    if (diff !== 0) return diff;
    return left.discussionPoint.localeCompare(right.discussionPoint, "de-DE");
  });

  return (
    <div className="container mx-auto space-y-8 pb-6 pt-12">
      <Stepper
        steps={stepLabels}
        current={displayStepNumber}
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
        currentEnabledStep <= 6 && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-sm text-muted">
              Der nächste Schritt ist freigeschaltet.
            </p>
          <Link
            href={`/diskussion/schritt/${currentEnabledStep}?code=${code}&name=${encodeURIComponent(name)}`}
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            Zum nächsten Schritt
          </Link>
          </CardContent>
        </Card>
      )}

      {step === 1 ? (
        <div className="grid gap-6">
	        {isHost ? (
	          <Card>
	            <CardHeader>
	              <CardTitle>Werterahmen</CardTitle>
	            </CardHeader>
	            <CardContent className="space-y-4 text-sm text-muted">
	                <p>
	                  Diese Ansicht ist für die Projektion im Kurs. Der Werterahmen wird im
	                  nächsten Schritt über das Rankingdiagramm festgelegt.
	                </p>
                {participantCount !== null && readyCount !== null && (
                  <p className="text-xs text-muted">
                    Bereitschaft: {readyCount} / {participantCount}
                  </p>
                )}
                {remainingParticipants !== null && (
                  <p className="text-xs text-muted">
                    Noch nicht bereit: {remainingParticipants}
                  </p>
                )}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {valuesList.map((label) => {
                      return (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink"
                        >
                          <span className="truncate">{label}</span>
                        </div>
                      );
                    })}
                  </div>
              </CardContent>
            </Card>
        ) : (
            <Card>
              <CardHeader>
                <CardTitle>Werte auswählen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted">
                  Wähle bis zu {valuesCount} Werte aus, die dir am wichtigsten sind.
                </p>
                <ValueSelector
                  values={shuffledValuesList}
                  selected={selectedValues}
                  max={valuesCount}
                  onChange={isReviewMode ? () => {} : setSelectedValues}
                />
                <div className="flex flex-wrap gap-2">
                  {!isReviewMode && (
                    <Button
                      onClick={() => handleReadyToggle(!isReady)}
                      variant={isReady ? "outline" : "primary"}
                      disabled={loading}
                    >
                      {isReady ? "Nicht bereit" : "Bereit melden"}
                    </Button>
                  )}
                </div>
                {loading && <p className="text-xs text-muted">Werte werden gespeichert...</p>}
                {statusMessage && (
                  <p className="text-sm text-muted">{statusMessage}</p>
                )}
                {readyUpdatedAt && (
                  <p className="text-xs text-muted">
                    Status zuletzt geändert:{" "}
                    {new Date(readyUpdatedAt).toLocaleString("de-DE")}
                  </p>
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
                    onStepChange={handleHostStepChange}
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
      ) : (step === 2 || step === 3) ? (
        <div className={isHost ? "grid gap-6" : "grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"}>
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Rankingdiagramm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted">
                {isHost ? (
                  <p className="text-xs text-muted">
                    Wähle Balken aus, um den Werterahmen festzulegen.
                  </p>
                ) : (
                  <p className="text-xs text-muted">
                    Deine ausgewählten Werte sind markiert. Die Leitung legt den Werterahmen fest.
                  </p>
                )}
                {topValues.length > 0 ? (
                  topValues.map((item) => {
                    const valueId = valueIdByLabel[item.value];
                    const checked = valueId ? Boolean(frameSelections[valueId]) : false;
                    const chosenByMe = selectedValueLabels.has(item.value);
                    const maxCount = topValues[0]?.count ?? 1;
                    const width = Math.max((item.count / maxCount) * 100, 4);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        disabled={!isHost || !valueId || !adminUserId}
                        onClick={() => {
                          if (!valueId) return;
                          handleFrameToggle(item.value, !checked);
                        }}
                        className={`w-full space-y-2 rounded-xl border border-border px-3 py-2 text-left ${
                          checked ? "bg-accent/10" : "bg-bg"
                        } ${chosenByMe ? "ring-2 ring-primary/40" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className={checked ? "text-ink" : "text-muted"}>{item.value}</span>
                          <span className={checked ? "text-ink" : "text-muted"}>{item.count}</span>
                        </div>
                        <div className="h-2 w-full rounded-none bg-border">
                          <div
                            className={`h-2 rounded-none ${checked ? "bg-accent" : "bg-ink/40"}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p>Noch keine Daten.</p>
                )}
                {isHost && zeroVoteValues.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-muted">Werte ohne Stimmen</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {zeroVoteValues.map((label) => {
                        const valueId = valueIdByLabel[label];
                        const checked = valueId ? Boolean(frameSelections[valueId]) : false;
                        return (
                          <button
                            key={label}
                            type="button"
                            disabled={!valueId || !adminUserId}
                            onClick={() => {
                              if (!valueId) return;
                              handleFrameToggle(label, !checked);
                            }}
                            className={`flex items-center justify-between gap-2 rounded-2xl border border-border px-4 py-3 text-sm ${
                              checked ? "bg-accent text-white" : "bg-surface text-ink hover:bg-surface/80"
                            }`}
                          >
                            <span className="truncate">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!isHost && !isReviewMode && !isReady && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={() => handleReadyToggle(true)}
                      variant="primary"
                      disabled={loading}
                    >
                      Bereit melden
                    </Button>
                  </div>
                )}
                {statusMessage && <p className="text-sm text-muted">{statusMessage}</p>}
                {readyUpdatedAt && (
                  <p className="text-xs text-muted">
                    Status zuletzt geändert:{" "}
                    {new Date(readyUpdatedAt).toLocaleString("de-DE")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!isHost && step === 3 && !isReviewMode && (
            <Card>
              <CardHeader>
                <CardTitle>Normen formulieren</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted">
                  Formuliere eine Norm und beziehe dich dabei auf einen Wert aus dem
                  Werterahmen.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">Wert aus dem Werterahmen</label>
                  <select
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring"
                    value={selectedNormValueId}
                    onChange={(event) => setSelectedNormValueId(event.target.value)}
                  >
                    <option value="">Bitte auswählen</option>
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
                    Status zuletzt geändert:{" "}
                    {new Date(readyUpdatedAt).toLocaleString("de-DE")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

	          <div className="space-y-4">
	            {step === 3 && (settings.normsEnabled || sortedGroupNorms.length > 0) && (
	              <Card>
	                <CardHeader>
	                  <CardTitle>Normen der Gruppe</CardTitle>
	                </CardHeader>
	                <CardContent className="space-y-3 text-sm text-muted">
	                  {sortedGroupNorms.length > 0 ? (
	                    (showAllGroupNorms ? sortedGroupNorms : sortedGroupNorms.slice(0, 3)).map(
	                      (norm) => (
	                        <div key={norm.id} className="space-y-1">
	                          <p className="text-ink">{norm.norm}</p>
	                          <p className="text-xs text-muted">
	                            {participantNameByUserId[norm.userId] ?? "Unbekannt"} · Bezug:{" "}
	                            {valueLabelById[norm.basedOnValueId] ?? "Unbekannt"}
	                          </p>
	                        </div>
	                      )
	                    )
	                  ) : (
	                    <p>Noch keine Normen erfasst.</p>
	                  )}
	                  {sortedGroupNorms.length > 3 && (
	                    <Button
	                      size="sm"
	                      variant="outline"
	                      onClick={() => setShowAllGroupNorms((prev) => !prev)}
	                    >
	                      {showAllGroupNorms ? "Weniger anzeigen" : "Mehr anzeigen"}
	                    </Button>
	                  )}
	                </CardContent>
	              </Card>
	            )}
	            {!isHost && step === 3 && (
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
            {!isHost && step === 3 && (
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
                  <p>Noch kein Werterahmen festgelegt.</p>
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
                    onStepChange={handleHostStepChange}
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
	      ) : step === 4 ? (
	        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
	          <div className="space-y-4">
	            {!isHost && (
	              <Card>
	                <CardHeader>
	                  <CardTitle>Deine Begründung</CardTitle>
	                </CardHeader>
			                <CardContent className="space-y-4">
			                  <div>
			                    <p className="text-sm text-muted">{stepPrompt}</p>
			                    {stepData.helper && <p className="text-xs text-muted">{stepData.helper}</p>}
			                  </div>
			                  {participantMainConclusion ? (
			                    <div className="rounded-xl border border-border bg-bg px-3 py-2">
			                      <p className="whitespace-pre-wrap text-ink">{participantMainConclusion}</p>
			                      <p className="mt-2 text-xs text-muted">
			                        Du kannst in diesem Schritt nur eine Begründung abgeben.
	                      </p>
	                    </div>
	                  ) : (
	                    <div className="space-y-2">
	                      <textarea
	                        rows={6}
	                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
	                        placeholder="Deine Begründung..."
	                        value={inclusionDraft}
	                        onChange={(event) => setInclusionDraft(event.target.value)}
	                        disabled={inclusionSaving}
	                      />
	                      <Button
	                        onClick={handleInclusionSubmit}
	                        disabled={inclusionSaving || !inclusionDraft.trim()}
	                      >
	                        Antwort speichern
	                      </Button>
	                      {inclusionError && (
	                        <p className="text-xs text-accent2">{inclusionError}</p>
	                      )}
	                    </div>
	                  )}
	                  {!isReviewMode && (
	                    <div className="flex flex-wrap gap-2">
	                      <Button
	                        onClick={() => handleReadyToggle(!isReady)}
	                        variant={isReady ? "outline" : "primary"}
	                      >
	                        {isReady ? "Nicht bereit" : "Bereit melden"}
	                      </Button>
	                    </div>
	                  )}
	                  {statusMessage && <p className="text-sm text-muted">{statusMessage}</p>}
	                  {readyUpdatedAt && (
	                    <p className="text-xs text-muted">
	                      Status zuletzt geändert:{" "}
	                      {new Date(readyUpdatedAt).toLocaleString("de-DE")}
	                    </p>
	                  )}
	                </CardContent>
	              </Card>
	            )}
	            <Card>
		              <CardHeader>
		                <CardTitle>Begründungen der Gruppe</CardTitle>
		              </CardHeader>
		              <CardContent className="space-y-3 text-sm text-muted">
		                <p className="text-xs text-muted">Wer oder was muss geschützt werden?</p>
		                {participantsWithUser.filter((item) => item.mainConclusion).length > 0 ? (
		                  participantsWithUser
		                    .filter((item) => item.mainConclusion)
		                    .map((participant) => (
	                      <div
	                        key={participant.id}
	                        className="space-y-1 rounded-xl border border-border bg-bg px-3 py-2"
	                      >
	                        <p className="text-xs text-muted">
	                          {participant.user?.name ?? "Unbekannt"}
	                        </p>
	                        <p className="whitespace-pre-wrap text-ink">{participant.mainConclusion}</p>
	                      </div>
	                    ))
	                ) : (
	                  <p>Noch keine Begründungen erfasst.</p>
	                )}
	              </CardContent>
	            </Card>
	            <Card>
	              <CardHeader>
	                <CardTitle>Begriffsklärung: Inklusionsproblem</CardTitle>
	              </CardHeader>
	              <CardContent>
	                <details className="text-sm text-muted">
	                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-ink">
	                    Anzeigen
	                  </summary>
	                  <div className="mt-3 space-y-4">
	                    <div className="space-y-2">
	                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
	                        Leitfrage
	                      </p>
	                      <p className="text-ink">{begriffsklaerungInklusionsproblem.leitfrage}</p>
	                      <p>{begriffsklaerungInklusionsproblem.einordnung}</p>
	                    </div>
	                    <div className="space-y-2">
	                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
	                        Mögliche Antworten
	                      </p>
	                      <div className="space-y-2">
	                        {begriffsklaerungInklusionsproblem.antworten.map((antwort) => (
	                          <div
	                            key={antwort.id}
	                            className="rounded-2xl border border-border bg-bg px-4 py-3"
	                          >
	                            <p className="text-sm font-semibold text-ink">{antwort.title}</p>
	                            <p className="mt-2 text-sm text-muted">{antwort.summary}</p>
	                            <p className="mt-2 text-sm text-ink">{antwort.focus}</p>
	                          </div>
	                        ))}
	                      </div>
	                    </div>
	                  </div>
	                </details>
	              </CardContent>
	            </Card>
		          </div>
			          <div className="space-y-4">
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
			                  <p>Noch kein Werterahmen festgelegt.</p>
			                )}
			              </CardContent>
			            </Card>
		            {(settings.normsEnabled || sortedGroupNorms.length > 0) && (
		              <Card>
		                <CardHeader>
		                  <CardTitle>Normen der Gruppe</CardTitle>
		                </CardHeader>
	                <CardContent className="space-y-3 text-sm text-muted">
	                  {sortedGroupNorms.length > 0 ? (
	                    (showAllGroupNorms ? sortedGroupNorms : sortedGroupNorms.slice(0, 3)).map(
	                      (norm) => (
	                        <div key={norm.id} className="space-y-1">
	                          <p className="text-ink">{norm.norm}</p>
	                          <p className="text-xs text-muted">
	                            {participantNameByUserId[norm.userId] ?? "Unbekannt"} · Bezug:{" "}
	                            {valueLabelById[norm.basedOnValueId] ?? "Unbekannt"}
	                          </p>
	                        </div>
	                      )
	                    )
	                  ) : (
	                    <p>Noch keine Normen erfasst.</p>
	                  )}
	                  {sortedGroupNorms.length > 3 && (
	                    <Button
	                      size="sm"
	                      variant="outline"
	                      onClick={() => setShowAllGroupNorms((prev) => !prev)}
	                    >
	                      {showAllGroupNorms ? "Weniger anzeigen" : "Mehr anzeigen"}
	                    </Button>
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
	                    onStepChange={handleHostStepChange}
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
	      ) : step === 5 ? (
	        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
	          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aktueller Diskussionspunkt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentDiscussionPointId ? (
                  <>
                    <p className="text-ink">
                      {activeDiscussionPoint?.discussionPoint ?? "Diskussionspunkt wird geladen..."}
                    </p>
                    {!isHost && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleSkipToggle(!hasSkipped)}
                          variant={hasSkipped ? "outline" : "primary"}
                          disabled={discussionActionLoading}
                        >
                          {hasSkipped ? "Weiter diskutieren" : "Frage überspringen"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    Entscheidet euch für einen nächsten Diskussionspunkt, mit dem ihr fortfahren wollt.
                  </p>
                )}
                {discussionActionError && (
                  <p className="text-xs text-accent2">{discussionActionError}</p>
                )}
              </CardContent>
            </Card>
	            <Card>
	              <CardHeader>
	                <CardTitle>Offene Diskussionspunkte</CardTitle>
	              </CardHeader>
	              <CardContent className="space-y-3 text-sm text-muted">
	                {sortedOpenDiscussionPoints.length > 0 ? (
	                  sortedOpenDiscussionPoints.map((point) => (
	                    <div
	                      key={point.id}
	                      className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-3 py-2 ${
	                        point.writtenByUserId === userId
	                          ? "border-primary/50 bg-primary/5"
	                          : "border-border bg-bg"
	                      }`}
	                    >
	                      <div className="space-y-1">
	                        <p className="text-ink">{point.discussionPoint}</p>
	                        {point.writtenByUserId === userId && (
	                          <p className="text-xs font-medium text-ink">Von dir eingebracht</p>
	                        )}
	                        <p className="text-xs text-muted">
	                          {discussionPointLikeCounts[point.id] ?? 0} Zustimmungen
	                        </p>
	                      </div>
	                      <Button
	                        size="sm"
	                        variant={discussionPointLikedByUser[point.id] ? "outline" : "primary"}
	                        onClick={() => handleDiscussionPointLikeToggle(point)}
	                        disabled={!userId}
	                      >
	                        {discussionPointLikedByUser[point.id]
	                          ? "Gefällt mir nicht mehr"
	                          : "Gefällt mir"}
	                      </Button>
	                    </div>
	                  ))
	                ) : (
	                  <p>Noch keine offenen Diskussionspunkte.</p>
	                )}
	              </CardContent>
	            </Card>
	            <Card>
	              <CardHeader>
	                <CardTitle>Abgeschlossene Diskussionspunkte</CardTitle>
	              </CardHeader>
	              <CardContent className="space-y-3 text-sm text-muted">
	                {sortedCompletedDiscussionPoints.length > 0 ? (
	                  sortedCompletedDiscussionPoints.map((point) => (
	                    <div
	                      key={point.id}
	                      className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-3 py-2 ${
	                        point.writtenByUserId === userId
	                          ? "border-primary/50 bg-primary/5"
	                          : "border-border bg-bg"
	                      }`}
	                    >
	                      <div className="space-y-1">
	                        <p className="text-ink">{point.discussionPoint}</p>
	                        {point.writtenByUserId === userId && (
	                          <p className="text-xs font-medium text-ink">Von dir eingebracht</p>
	                        )}
	                        <p className="text-xs text-muted">
	                          {discussionPointLikeCounts[point.id] ?? 0} Zustimmungen
	                        </p>
	                      </div>
	                      <Button
	                        size="sm"
	                        variant={discussionPointLikedByUser[point.id] ? "outline" : "primary"}
	                        onClick={() => handleDiscussionPointLikeToggle(point)}
	                        disabled={!userId}
	                      >
	                        {discussionPointLikedByUser[point.id]
	                          ? "Gefällt mir nicht mehr"
	                          : "Gefällt mir"}
	                      </Button>
	                    </div>
	                  ))
	                ) : (
	                  <p>Noch keine abgeschlossenen Diskussionspunkte.</p>
	                )}
	              </CardContent>
	            </Card>
	            {!isHost && discussionPointsForConclusions.length > 0 && (
	              <Card>
	                <CardHeader>
	                  <CardTitle>Zwischenfazit</CardTitle>
	                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted">
                  {discussionPointsForConclusions.map((point) => {
                    const pointConclusions = conclusionsByPoint[point.id] ?? [];
                    const ownConclusion = pointConclusions.find(
                      (item) => item.userId === userId
                    );
                    return (
                      <div
                        key={point.id}
                        className="space-y-3 rounded-xl border border-border bg-bg p-4"
                      >
                        <div className="space-y-1">
                          <p className="text-xs text-muted">Diskussionspunkt</p>
                          <p className="text-ink">{point.discussionPoint}</p>
                        </div>
                        {ownConclusion ? (
                          canEditConclusion ? (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-ink">Dein Fazit</label>
                              <textarea
                                rows={3}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Formuliere dein Fazit..."
                                value={conclusionDrafts[point.id] ?? ownConclusion.conclusion ?? ""}
                                onChange={(event) =>
                                  setConclusionDrafts((prev) => ({
                                    ...prev,
                                    [point.id]: event.target.value
                                  }))
                                }
                              />
                            <Button
                              onClick={() =>
                                handleConclusionUpdate(ownConclusion.id, point.id)
                              }
                            >
                              Fazit aktualisieren
                            </Button>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-border bg-surface px-3 py-2">
                              <p className="text-xs text-muted">Dein Fazit</p>
                              <p className="text-ink">{ownConclusion.conclusion}</p>
                            </div>
                          )
	                        ) : (
	                          <div className="space-y-2">
	                            <label className="text-sm font-medium text-ink">Dein Fazit</label>
                            <textarea
                              rows={3}
                              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="Formuliere dein Fazit..."
                              value={conclusionDrafts[point.id] ?? ""}
                              onChange={(event) =>
                                setConclusionDrafts((prev) => ({
                                  ...prev,
                                  [point.id]: event.target.value
                                }))
                              }
                            />
	                            <Button onClick={() => handleConclusionSubmit(point.id)}>
	                              Fazit speichern
	                            </Button>
	                          </div>
	                        )}
	                        <div className="space-y-3">
	                          <p className="text-xs text-muted">Fazit der Teilnehmenden</p>
	                          {pointConclusions.length > 0 ? (
	                            pointConclusions.map((conclusion) => {
	                              const comments = commentsByConclusion[conclusion.id] ?? [];
	                              return (
	                                <div
	                                  key={conclusion.id}
	                                  className="space-y-3 rounded-lg border border-border bg-surface p-3"
	                                >
	                                  <div className="space-y-1">
	                                    <p className="text-ink">{conclusion.conclusion}</p>
	                                    <p className="text-xs text-muted">
	                                      {userDirectory[conclusion.userId]?.name ?? "Unbekannt"}
	                                    </p>
	                                  </div>
	                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
	                                    <Button
	                                      size="sm"
	                                      variant={
	                                        conclusionLikedByUser[conclusion.id] ? "outline" : "primary"
	                                      }
	                                      onClick={() => handleConclusionLikeToggle(conclusion)}
	                                    >
	                                      {conclusionLikedByUser[conclusion.id]
	                                        ? "Gefällt mir nicht mehr"
	                                        : "Gefällt mir"}
	                                    </Button>
	                                    <span>
	                                      {conclusionLikeCounts[conclusion.id] ?? 0} Zustimmungen
	                                    </span>
	                                  </div>
	                                  <div className="space-y-2">
	                                    {comments.length > 0 ? (
	                                      comments.map((comment) => (
	                                        <div
	                                          key={comment.id}
	                                          className="rounded-md border border-border bg-bg px-3 py-2"
	                                        >
	                                          <p className="text-sm text-ink">{comment.comment}</p>
	                                          <p className="text-xs text-muted">
	                                            {userDirectory[comment.writtenByUserId]?.name ??
	                                              "Unbekannt"}{" "}
	                                            {comment.time
	                                              ? `· ${new Date(comment.time).toLocaleString(
	                                                  "de-DE"
	                                                )}`
	                                              : ""}
	                                          </p>
	                                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
	                                            <Button
	                                              size="sm"
	                                              variant={
	                                                commentLikedByUser[comment.id] ? "outline" : "primary"
	                                              }
	                                              onClick={() => handleCommentLikeToggle(comment)}
	                                            >
	                                              {commentLikedByUser[comment.id]
	                                                ? "Gefällt mir nicht mehr"
	                                                : "Gefällt mir"}
	                                            </Button>
	                                            <span>
	                                              {commentLikeCounts[comment.id] ?? 0} Zustimmungen
	                                            </span>
	                                          </div>
	                                        </div>
	                                      ))
	                                    ) : (
	                                      <p className="text-xs text-muted">Noch keine Kommentare.</p>
	                                    )}
	                                    <div className="space-y-2">
	                                      <label className="text-xs font-medium text-ink">
	                                        Kommentar
	                                      </label>
	                                      <textarea
	                                        rows={2}
	                                        className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
	                                        placeholder="Kommentar verfassen..."
	                                        value={commentDrafts[conclusion.id] ?? ""}
	                                        onChange={(event) =>
	                                          setCommentDrafts((prev) => ({
	                                            ...prev,
	                                            [conclusion.id]: event.target.value
	                                          }))
	                                        }
	                                      />
	                                      <Button
	                                        size="sm"
	                                        onClick={() => handleCommentSubmit(conclusion.id)}
	                                      >
	                                        Kommentar senden
	                                      </Button>
	                                    </div>
	                                  </div>
	                                </div>
	                              );
	                            })
	                          ) : (
	                            <p>Noch keine Fazits erfasst.</p>
	                          )}
	                        </div>
	                      </div>
	                    );
	                  })}
	                </CardContent>
	              </Card>
	            )}
	          </div>
	          <div className="space-y-4">
	            {!isHost && !isReviewMode && (
	              <Card>
	                <CardHeader>
	                  <CardTitle>Diskussionspunkt oder Frage stellen</CardTitle>
	                </CardHeader>
	                <CardContent>
	                  {remainingQuestions > 0 ? (
	                    <QuestionsForm
	                      maxQuestions={remainingQuestions}
	                      onSubmit={handleQuestionsSubmit}
	                    />
	                  ) : (
	                    <p className="text-sm text-muted">
	                      Du hast bereits alle {questionsCount} Fragen eingereicht.
	                    </p>
	                  )}
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
	                      Status zuletzt geändert:{" "}
	                      {new Date(readyUpdatedAt).toLocaleString("de-DE")}
	                    </p>
	                  )}
	                </CardContent>
	              </Card>
	            )}
	            <Card>
	              <CardHeader>
	                <CardTitle>Werterahmen</CardTitle>
	              </CardHeader>
	              <CardContent className="text-sm text-muted">
	                {selectedCatalogValues.length > 0 ? (
	                  <p className="text-ink">{selectedCatalogValues.join(", ")}</p>
	                ) : (
	                  <p>Noch kein Werterahmen festgelegt.</p>
	                )}
	              </CardContent>
	            </Card>
	            {(settings.normsEnabled || sortedGroupNorms.length > 0) && (
	              <Card>
	                <CardHeader>
	                  <CardTitle>Normen der Gruppe</CardTitle>
	                </CardHeader>
	                <CardContent className="space-y-3 text-sm text-muted">
	                  {sortedGroupNorms.length > 0 ? (
	                    (showAllGroupNorms ? sortedGroupNorms : sortedGroupNorms.slice(0, 3)).map(
	                      (norm) => (
	                        <div key={norm.id} className="space-y-1">
	                          <p className="text-ink">{norm.norm}</p>
	                          <p className="text-xs text-muted">
	                            {participantNameByUserId[norm.userId] ?? "Unbekannt"} · Bezug:{" "}
	                            {valueLabelById[norm.basedOnValueId] ?? "Unbekannt"}
	                          </p>
	                        </div>
	                      )
	                    )
	                  ) : (
	                    <p>Noch keine Normen erfasst.</p>
	                  )}
	                  {sortedGroupNorms.length > 3 && (
	                    <Button
	                      size="sm"
	                      variant="outline"
	                      onClick={() => setShowAllGroupNorms((prev) => !prev)}
	                    >
	                      {showAllGroupNorms ? "Weniger anzeigen" : "Mehr anzeigen"}
	                    </Button>
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
                        <p className="text-xs text-muted">Aktueller Diskussionspunkt</p>
                        <p className="text-ink">
                          {activeDiscussionPoint?.discussionPoint ?? "Diskussionspunkt wird geladen..."}
                        </p>
                      </div>
                      <p className="text-xs text-muted">
                        Überspringen-Stimmen: {skipVotes} / {adminParticipants.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handleCompleteDiscussionPoint}
                          disabled={discussionActionLoading}
                        >
                          Diskussionspunkt beenden
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted">
                        Wähle einen Diskussionspunkt aus dem Pool aus, um die Diskussion zu starten.
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
                                Diskussionspunkt starten
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p>Noch keine offenen Diskussionspunkte verfügbar.</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                    onStepChange={handleHostStepChange}
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
      ) : step === 6 ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
	          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Zeitstrahl der Diskussion</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">
                {completedDiscussionPoints.length > 0 ? (
                  <div className="relative overflow-x-auto pb-2">
                    <div className="absolute left-0 right-0 top-5 h-px bg-border" />
                    <div className="relative flex min-w-full gap-6 pb-2">
                      {completedDiscussionPoints.map((point, index) => (
                        <div key={point.id} className="min-w-[220px] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-primary" />
                            <span className="text-xs text-muted">Punkt {index + 1}</span>
                          </div>
                          <p className="text-ink">{point.discussionPoint}</p>
                          <p className="text-xs text-muted">
                            {discussionPointLikeCounts[point.id] ?? 0} Zustimmungen
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>Noch keine abgeschlossenen Diskussionspunkte.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fazit zu Diskussionspunkten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted">
                {completedDiscussionPoints.length > 0 ? (
                  completedDiscussionPoints.map((point) => {
                    const pointConclusions = conclusionsByPoint[point.id] ?? [];
                    const ownConclusion = pointConclusions.find(
                      (item) => item.userId === userId
                    );
                    return (
                      <div
                        key={point.id}
                        className="space-y-4 rounded-xl border border-border bg-bg p-4"
                      >
                        <div className="space-y-1">
                          <p className="text-xs text-muted">Diskussionspunkt</p>
                          <p className="text-ink">{point.discussionPoint}</p>
                        </div>

                        {ownConclusion ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-ink">Dein Fazit</label>
                            <textarea
                              rows={3}
                              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="Formuliere dein Fazit..."
                              value={conclusionDrafts[point.id] ?? ownConclusion.conclusion ?? ""}
                              onChange={(event) =>
                                setConclusionDrafts((prev) => ({
                                  ...prev,
                                  [point.id]: event.target.value
                                }))
                              }
                            />
                            <Button
                              onClick={() =>
                                handleConclusionUpdate(ownConclusion.id, point.id)
                              }
                            >
                              Fazit aktualisieren
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-ink">Dein Fazit</label>
                            <textarea
                              rows={3}
                              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="Formuliere dein Fazit..."
                              value={conclusionDrafts[point.id] ?? ""}
                              onChange={(event) =>
                                setConclusionDrafts((prev) => ({
                                  ...prev,
                                  [point.id]: event.target.value
                                }))
                              }
                            />
                            <Button onClick={() => handleConclusionSubmit(point.id)}>
                              Fazit speichern
                            </Button>
                          </div>
                        )}

                        <div className="space-y-3">
                          <p className="text-xs text-muted">Fazit der Teilnehmenden</p>
                          {pointConclusions.length > 0 ? (
                            pointConclusions.map((conclusion) => {
                              const comments = commentsByConclusion[conclusion.id] ?? [];
                              return (
                                <div
                                  key={conclusion.id}
                                  className="space-y-3 rounded-lg border border-border bg-surface p-3"
                                >
                                  <div className="space-y-1">
                                    <p className="text-ink">{conclusion.conclusion}</p>
                                    <p className="text-xs text-muted">
                                      {userDirectory[conclusion.userId]?.name ?? "Unbekannt"}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                                    <Button
                                      size="sm"
                                      variant={
                                        conclusionLikedByUser[conclusion.id] ? "outline" : "primary"
                                      }
                                      onClick={() => handleConclusionLikeToggle(conclusion)}
                                    >
                                      {conclusionLikedByUser[conclusion.id]
                                        ? "Gefällt mir nicht mehr"
                                        : "Gefällt mir"}
                                    </Button>
                                    <span>
                                      {conclusionLikeCounts[conclusion.id] ?? 0} Zustimmungen
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {comments.length > 0 ? (
                                      comments.map((comment) => (
                                        <div
                                          key={comment.id}
                                          className="rounded-md border border-border bg-bg px-3 py-2"
                                        >
                                          <p className="text-sm text-ink">{comment.comment}</p>
                                          <p className="text-xs text-muted">
                                            {userDirectory[comment.writtenByUserId]?.name ??
                                              "Unbekannt"}{" "}
                                            {comment.time
                                              ? `· ${new Date(comment.time).toLocaleString(
                                                  "de-DE"
                                                )}`
                                              : ""}
                                          </p>
                                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                                            <Button
                                              size="sm"
                                              variant={
                                                commentLikedByUser[comment.id] ? "outline" : "primary"
                                              }
                                              onClick={() => handleCommentLikeToggle(comment)}
                                            >
                                              {commentLikedByUser[comment.id]
                                                ? "Gefällt mir nicht mehr"
                                                : "Gefällt mir"}
                                            </Button>
                                            <span>
                                              {commentLikeCounts[comment.id] ?? 0} Zustimmungen
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-muted">
                                        Noch keine Kommentare.
                                      </p>
                                    )}
                                    <div className="space-y-2">
                                      <label className="text-xs font-medium text-ink">
                                        Kommentar
                                      </label>
                                      <textarea
                                        rows={2}
                                        className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Kommentar verfassen..."
                                        value={commentDrafts[conclusion.id] ?? ""}
                                        onChange={(event) =>
                                          setCommentDrafts((prev) => ({
                                            ...prev,
                                            [conclusion.id]: event.target.value
                                          }))
                                        }
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleCommentSubmit(conclusion.id)}
                                      >
                                        Kommentar senden
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p>Noch keine Fazits erfasst.</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Noch keine abgeschlossenen Diskussionspunkte vorhanden.</p>
                )}
                {fazitError && <p className="text-xs text-accent2">{fazitError}</p>}
              </CardContent>
            </Card>
	            {isHost && (
	              <Card>
	                <CardHeader>
	                  <CardTitle>Veröffentlichung</CardTitle>
	                </CardHeader>
	                <CardContent className="space-y-3 text-sm text-muted">
	                  <Button
	                    onClick={handlePublishDiscussion}
	                    disabled={discussionActionLoading}
	                  >
	                    Diskussion veröffentlichen
	                  </Button>
	                  {discussionActionError && (
	                    <p className="text-xs text-accent2">{discussionActionError}</p>
	                  )}
	                  {statusMessage && <p className="text-sm text-muted">{statusMessage}</p>}
	                </CardContent>
	              </Card>
	            )}
          </div>

	          <div className="space-y-4">
	            <Card>
	              <CardHeader>
	                <CardTitle>Werterahmen</CardTitle>
	              </CardHeader>
	              <CardContent className="text-sm text-muted">
	                {selectedCatalogValues.length > 0 ? (
	                  <p className="text-ink">{selectedCatalogValues.join(", ")}</p>
	                ) : (
	                  <p>Noch kein Werterahmen festgelegt.</p>
	                )}
	              </CardContent>
	            </Card>
	            {(settings.normsEnabled || sortedGroupNorms.length > 0) && (
	              <Card>
	                <CardHeader>
	                  <CardTitle>Normen der Gruppe</CardTitle>
	                </CardHeader>
	                <CardContent className="space-y-3 text-sm text-muted">
	                  {sortedGroupNorms.length > 0 ? (
	                    (showAllGroupNorms ? sortedGroupNorms : sortedGroupNorms.slice(0, 3)).map(
	                      (norm) => (
	                        <div key={norm.id} className="space-y-1">
	                          <p className="text-ink">{norm.norm}</p>
	                          <p className="text-xs text-muted">
	                            {participantNameByUserId[norm.userId] ?? "Unbekannt"} · Bezug:{" "}
	                            {valueLabelById[norm.basedOnValueId] ?? "Unbekannt"}
	                          </p>
	                        </div>
	                      )
	                    )
	                  ) : (
	                    <p>Noch keine Normen erfasst.</p>
	                  )}
	                  {sortedGroupNorms.length > 3 && (
	                    <Button
	                      size="sm"
	                      variant="outline"
	                      onClick={() => setShowAllGroupNorms((prev) => !prev)}
	                    >
	                      {showAllGroupNorms ? "Weniger anzeigen" : "Mehr anzeigen"}
	                    </Button>
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
	                    onStepChange={handleHostStepChange}
	                  />
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
                Status zuletzt geändert:{" "}
                {new Date(readyUpdatedAt).toLocaleString("de-DE")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
