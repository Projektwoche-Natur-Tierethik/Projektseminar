"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteClassName() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (pathname === "/") {
      root.classList.add("route-start");
    } else {
      root.classList.remove("route-start");
    }
  }, [pathname]);

  return null;
}
