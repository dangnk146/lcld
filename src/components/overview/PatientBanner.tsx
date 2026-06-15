"use client";

import { User } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function PatientBanner() {
  const { patient, activePatient, activeVisitIndex, setActiveVisitIndex } = useApp();

  return (
    <section className="dash-card-blue px-4 py-3 flex items-center gap-4 shrink-0 overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-blue-100">Hồ sơ bệnh nhân</p>
          <h2 className="text-sm font-black flex items-center gap-2">
            {patient.name}
            <span
              className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                activePatient.status === "deceased" ? "bg-rose-500/80" : "bg-emerald-400/80"
              }`}
            >
              {activePatient.status === "deceased" ? "Deceased" : "Active"}
            </span>
          </h2>
        </div>
      </div>

      <div className="h-8 w-px bg-white/25 shrink-0" />

      {[
        { label: "Tuổi", value: patient.age },
        { label: "Giới", value: patient.sex === "male" ? "Nam" : "Nữ" },
        { label: "ESC", value: patient.riskRegion.toUpperCase() },
        { label: "LDL-C", value: `${patient.ldlChol} ${patient.unit}` },
        { label: "BP", value: `${patient.sbp}/${patient.dbp}` },
      ].map((stat) => (
        <div key={stat.label} className="shrink-0 text-center px-3">
          <p className="text-[8px] font-bold uppercase text-blue-200">{stat.label}</p>
          <p className="text-sm font-black">{stat.value}</p>
        </div>
      ))}

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 shrink-0">
        {activePatient.visits.map((v, idx) => (
          <button
            key={v.id}
            onClick={() => setActiveVisitIndex(idx)}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeVisitIndex === idx
                ? "bg-white text-blue-600 shadow-md"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {v.visitDate}
          </button>
        ))}
      </div>
    </section>
  );
}
