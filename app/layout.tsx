import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import SiteShell from "@/src/components/layout/SiteShell";

const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope" });
const serif = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Ethik-Dialog | Umwelt- und Tierethik",
  description:
    "Diskursplattform für Umwelt- und Tierethik im universitaeren Kontext."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var root=document.documentElement;var path=location.pathname||'';if(path==='/'){root.classList.add('route-start');}else{root.classList.remove('route-start');}var theme=localStorage.getItem('theme');if(theme!=='light'&&theme!=='dark'){return;}root.classList.remove('theme-light','theme-dark');root.classList.add('theme-'+theme);}catch(e){}})();"
          }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
