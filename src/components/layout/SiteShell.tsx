import type { ReactNode } from "react";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";

type SiteShellProps = {
  children: ReactNode;
};

export default function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-bg text-ink site-bg">
      <Header />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
          <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent2/20 blur-3xl" />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
