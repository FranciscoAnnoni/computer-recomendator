"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

const PAGES_WITHOUT_FOOTER = ["/", "/catalog", "/quiz"];

export function FooterWrapper() {
  const pathname = usePathname();
  if (PAGES_WITHOUT_FOOTER.includes(pathname)) return null;
  return <Footer />;
}
