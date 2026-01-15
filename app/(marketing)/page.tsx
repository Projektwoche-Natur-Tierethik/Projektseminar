import Image from "next/image";
import Link from "next/link";
import WolfButton from "@/src/components/home/WolfButton";
import { buttonStyles } from "@/src/components/ui/Button";

export const metadata = {
  title: "Ethik-Dialog | Start",
  description:
    "Plattform für Umwelt- und Tierethik mit Diskussionsassistent und Ressourcen."
};

export default function HomePage() {
  return (
    <div className="relative isolate">
      <section className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 pb-16 pt-12 sm:px-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div className="wolf-stage pointer-events-none">
            <Image
              src="/medien/startseite/wolfHintergrund.jpg"
              alt="Hintergrundbild mit Wolf und Baumstamm"
              fill
              priority
              className="wolf-stage__image"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <WolfButton className="wolf-stage__button pointer-events-auto" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md space-y-6 border border-border bg-surface/70 p-6 backdrop-blur-sm">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Seminar Anwendungsethik
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Diskursraum für Umwelt- und Tierethik
            </h1>
            <p className="text-sm text-muted">
              Klarer Einstieg in den Diskurs: Wissen, Struktur und Dialog an einem Ort.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/diskussion/erstellen"
              className={buttonStyles({ variant: "primary", size: "md", className: "w-full justify-start" })}
            >
              Diskussion starten
            </Link>
            <Link
              href="/diskussionsassistent"
              className={buttonStyles({ variant: "outline", size: "md", className: "w-full justify-start" })}
            >
              Diskussionsassistent
            </Link>
            <Link
              href="/begriffsklaerung"
              className={buttonStyles({ variant: "outline", size: "md", className: "w-full justify-start" })}
            >
              Begriffsklärung
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
