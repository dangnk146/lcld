"use client";

import { Table4Matrix } from "@/components/workspace/Table4Matrix";
import { useApp } from "@/context/AppContext";

export function Table4Section() {
  const { lang, translations } = useApp();

  return (
    <section className="dash-card overflow-hidden">
      <div className="px-4 py-3 bg-sky-700 text-white border-b border-sky-600">
        <h2 className="text-xs font-semibold uppercase tracking-wide">
          {lang === "vi" ? "Bảng 4 — Chiến lược can thiệp" : "Table 4 — Intervention Strategy"}
        </h2>
        <p className="text-[10px] text-sky-100 mt-0.5">
          {translations[lang].table4Title}
        </p>
      </div>
      <div className="p-4">
        <Table4Matrix />
      </div>
    </section>
  );
}
