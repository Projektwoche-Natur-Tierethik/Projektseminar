"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type WolfButtonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export default function WolfButton({ className, style }: WolfButtonProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  function handleClick() {
    if (isAnimating) return;
    setIsAnimating(true);
    router.push("/diskussionsassistent");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`wolf-button ${isAnimating ? "wolf-button--active" : ""} ${className ?? ""}`}
      style={style}
      aria-label="Zur Diskussion"
    >
      <span className="sr-only">Zur Diskussion</span>
      <span className="wolf-button__center" aria-hidden="true" />
      <Image
        src="/medien/startseite/wolf_ausgeschnitten.png"
        alt=""
        width={900}
        height={900}
        className="h-auto w-full drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
      />
    </button>
  );
}
