"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Key, Languages } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { PageSlug } from "@/lib/types";

const NAV_ITEMS: { slug: PageSlug; href: string; vi: string; en: string }[] = [
  { slug: "overview", href: "/overview", vi: "Tổng quan chẩn đoán", en: "Overview" },
  { slug: "mdt-analysis", href: "/mdt-analysis", vi: "Phân tích MDT (AI)", en: "MDT Analysis (AI)" },
  { slug: "reference", href: "/reference", vi: "Hướng dẫn ESC 2025", en: "ESC Guidelines" },
  { slug: "history", href: "/history", vi: "Lịch sử ca bệnh", en: "Patient History" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { lang, setLang, showKeyInput, setShowKeyInput } = useApp();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <svg className="w-5 h-4 text-black shrink-0" viewBox="0 0 115 100" fill="currentColor">
              <path d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>
            <span className="text-zinc-300">/</span>
            <span className="font-semibold text-zinc-700">uit-cardio</span>
            <span className="text-zinc-300">/</span>
            <Link href="/overview" className="font-semibold text-zinc-900 tracking-tight hover:underline">
              la-chan-tam-mach-2025
            </Link>
            <div className="ml-3 hidden sm:flex items-center gap-1.5 bg-zinc-100 text-zinc-600 border border-zinc-200/80 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Consensus Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-250"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OpenClaw Gateway Connected</span>
            </div>

            <button
              onClick={() => setLang(lang === "vi" ? "en" : "vi")}
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-zinc-500" />
              <span>{lang === "vi" ? "EN" : "VI"}</span>
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-6 -mb-px overflow-x-auto scrollbar-none text-[13px] font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.slug}
                href={item.href}
                className={`py-3 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-black text-black font-semibold"
                    : "border-transparent text-zinc-500 hover:text-black"
                }`}
              >
                {lang === "vi" ? item.vi : item.en}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
