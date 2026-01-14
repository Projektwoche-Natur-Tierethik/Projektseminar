"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";

type CopyCodeButtonProps = {
  code: string;
};

export default function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      {copied ? "Code kopiert" : "Code kopieren"}
    </Button>
  );
}
