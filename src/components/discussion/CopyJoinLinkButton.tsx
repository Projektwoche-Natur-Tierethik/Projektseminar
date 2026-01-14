"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";

type CopyJoinLinkButtonProps = {
  code: string;
};

export default function CopyJoinLinkButton({ code }: CopyJoinLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const origin = window.location.origin;
      const joinUrl = `${origin}/diskussion/join?code=${encodeURIComponent(code)}`;
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      {copied ? "Link kopiert" : "Einladungslink kopieren"}
    </Button>
  );
}
