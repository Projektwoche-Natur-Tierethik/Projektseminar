"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type WerteAutoRedirectProps = {
  code: number;
  name: string;
};

export default function WerteAutoRedirect({ code, name }: WerteAutoRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    if (!code || !name) return;
    let isMounted = true;

    const checkStatus = () => {
      fetch(`/api/diskussion/status?code=${code}&name=${encodeURIComponent(name)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const currentStep = Number(data.currentStep ?? 0);
          if (currentStep >= 2 && currentStep <= 6) {
            router.push(
              `/diskussion/schritt/${currentStep}?code=${code}&name=${encodeURIComponent(name)}`
            );
          } else if (currentStep > 6) {
            router.push(`/diskussion/schritt/6?code=${code}&name=${encodeURIComponent(name)}`);
          }
        })
        .catch(() => {});
    };

    checkStatus();
    const interval = window.setInterval(checkStatus, 2000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [code, name, router]);

  return null;
}
