"use client";

import { useEffect, useState } from "react";

type JoinQrCodeProps = {
  code: string;
};

export default function JoinQrCode({ code }: JoinQrCodeProps) {
  const [joinUrl, setJoinUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setJoinUrl(`${origin}/diskussion/join?code=${encodeURIComponent(code)}`);
  }, [code]);

  if (!joinUrl) {
    return null;
  }

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    joinUrl
  )}`;
  const qrLargeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
    joinUrl
  )}`;

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="QR-Code vergroessern"
      >
        <img
          src={qrSrc}
          alt="QR-Code fuer den Beitritt"
          width={180}
          height={180}
          className="rounded-xl"
          loading="lazy"
        />
      </button>
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">QR-Code fuer den Beitritt</p>
        <p className="text-xs text-muted">Antippen zum Vergroessern.</p>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-bg px-6 py-6"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={qrLargeSrc}
              alt="QR-Code fuer den Beitritt"
              width={340}
              height={340}
              className="rounded-xl border border-border"
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-none border border-border px-4 py-2 text-sm text-ink"
            >
              Schliessen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
