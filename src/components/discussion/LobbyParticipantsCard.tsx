"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

type LobbyParticipant = {
  id: string;
  admin: boolean;
  user?: {
    name?: string | null;
  } | null;
};

type LobbyParticipantsCardProps = {
  discussionId: string;
  initialParticipants: LobbyParticipant[];
  isHost: boolean;
};

export default function LobbyParticipantsCard({
  discussionId,
  initialParticipants,
  isHost
}: LobbyParticipantsCardProps) {
  const [participants, setParticipants] = useState<LobbyParticipant[]>(initialParticipants);

  useEffect(() => {
    if (!isHost || !discussionId) return;
    let isMounted = true;

    const fetchParticipants = () => {
      fetch(
        `/api/participants?discussionId=${encodeURIComponent(
          discussionId
        )}&includeUser=true&t=${Date.now()}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const items = Array.isArray(data.participants) ? data.participants : [];
          setParticipants(items);
        })
        .catch(() => {
          if (!isMounted) return;
        });
    };

    fetchParticipants();
    const interval = window.setInterval(fetchParticipants, 3000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [isHost, discussionId]);

  const activeParticipants = participants.filter((participant) => !participant.admin);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teilnehmende ({activeParticipants.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between gap-3">
            <span>{participant.user?.name ?? "Unbekannt"}</span>
            {participant.admin && <span className="text-xs">Leitung</span>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
