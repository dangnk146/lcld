"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Heart, Languages, Settings, Sparkles } from "lucide-react";
import { FatalAlert } from "@/components/layout/FatalAlert";
import { useApp } from "@/context/AppContext";
import type { PageSlug } from "@/lib/types";

const NAV: {
  slug: PageSlug;
  href: string;
  vi: string;
  en: string;
  icon: ReactNode;
}[] = [
  {
    slug: "patients",
    href: "/patients",
    vi: "Hồ sơ bệnh nhân",
    en: "Patient Records",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    slug: "ai-agent",
    href: "/ai-agent",
    vi: "AI Agent",
    en: "AI Agent",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    slug: "settings",
    href: "/settings",
    vi: "Cấu hình",
    en: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang } = useApp();

  return (
    <div className="min-h-screen flex page-bg">
      <aside className="w-[220px] shrink-0 bg-white border-r border-sky-100 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-4 border-b border-sky-100">
          <Link href="/patients" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-tight leading-none text-sky-900 uppercase">LÁ CHẮN TÂM MẠCH</p>
              <p className="text-[9px] text-sky-600 font-medium">ESC/EAS 2025</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.slug}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all ${
                  active
                    ? "bg-sky-50 text-sky-800 border-l-[3px] border-sky-700"
                    : "text-slate-500 hover:text-sky-700 hover:bg-sky-50/60 border-l-[3px] border-transparent"
                }`}
              >
                <span className={active ? "text-sky-700" : "text-slate-400"}>{item.icon}</span>
                {lang === "vi" ? item.vi : item.en}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sky-100 flex flex-col gap-2">
          <button
            onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-sky-700 hover:bg-sky-50 cursor-pointer w-full justify-start"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "vi" ? "English" : "Tiếng Việt"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <main className="flex-1 flex flex-col p-4 gap-3 min-h-0 overflow-hidden">
          <FatalAlert />
          <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">{children}</div>
        </main>

        <footer className="shrink-0 h-9 bg-white border-t border-sky-100 flex items-center justify-center text-[10px] text-slate-400">
          Lá Chắn Tâm Mạch © 2026 · ESC/EAS 2025 Focused Update
        </footer>
      </div>
    </div>
  );
}
