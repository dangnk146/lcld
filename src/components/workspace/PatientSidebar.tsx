"use client";

import { ChevronDown, ChevronRight, Loader2, Skull, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePatientAvatar } from "@/app/actions/generate-avatar";
import { useApp } from "@/context/AppContext";
import { buildAvatarPrompt } from "@/lib/patient-avatars";
import { calculateRisk } from "@/lib/risk";

export function PatientSidebar() {
  const router = useRouter();
  const {
    patients,
    lang,
    activePatientId,
    activeVisitIndex,
    setActivePatientId,
    setActiveVisitIndex,
    patientAvatars,
    setPatientAvatar,
    setShowKeyInput,
  } = useApp();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(patients.map((p) => [p.id, p.id === activePatientId]))
  );
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const togglePatient = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    setActivePatientId(id);
    router.push(`/patients/${id}`);
  };

  const selectVisit = (patientId: string, visitIndex: number) => {
    setActivePatientId(patientId);
    setActiveVisitIndex(visitIndex);
    setExpanded((prev) => ({ ...prev, [patientId]: true }));
    router.push(`/patients/${patientId}`);
  };

  const handleGenAvatar = async (e: React.MouseEvent, patientId: string) => {
    e.stopPropagation();
    setGenError(null);

    const p = patients.find((x) => x.id === patientId);
    if (!p) return;

    const pd = p.visits[0]?.patientData;
    if (!pd) return;

    setGeneratingId(patientId);
    const prompt = buildAvatarPrompt(pd.name, pd.age, pd.sex, p.status);
    const result = await generatePatientAvatar(prompt);
    setGeneratingId(null);

    if (result.success && result.dataUrl) {
      setPatientAvatar(patientId, result.dataUrl);
    } else {
      setGenError(result.error || "Không tạo được avatar");
    }
  };

  return (
    <aside className="w-full h-full min-h-0 flex flex-col border border-sky-100 rounded-xl bg-white overflow-hidden">
      <div className="px-3 py-2.5 bg-sky-700 text-white border-b border-sky-600">
        <p className="text-[11px] font-semibold">Bệnh nhân</p>
        <p className="text-[9px] text-sky-100">{patients.length} hồ sơ · FLUX avatar</p>
      </div>

      {genError && (
        <p className="text-[9px] text-rose-600 bg-rose-50 px-2 py-1.5 border-b border-rose-100">{genError}</p>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {patients.map((p) => {
          const isOpen = expanded[p.id];
          const isActivePatient = p.id === activePatientId;
          const avatar = patientAvatars[p.id];
          const isGenerating = generatingId === p.id;

          return (
            <div
              key={p.id}
              className={`border-b border-sky-50 last:border-0 ${isActivePatient ? "bg-sky-50" : ""}`}
            >
              <div className="flex items-center gap-1 pr-2">
              <button
                type="button"
                onClick={() => togglePatient(p.id)}
                className={`flex-1 flex items-center gap-2 px-3 py-2.5 text-left transition-colors cursor-pointer min-w-0 ${
                  isActivePatient ? "" : "hover:bg-sky-50/60"
                }`}
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}

                <div className="shrink-0">
                  {avatar ? (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-sky-200 bg-sky-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        p.status === "deceased" ? "bg-slate-200" : "bg-sky-600"
                      }`}
                    >
                      {p.status === "deceased" ? (
                        <Skull className="w-4 h-4 text-slate-500" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800 truncate leading-tight">
                    {p.patientName.split("(")[0].trim()}
                  </p>
                  <p className="text-[9px] text-slate-500">{p.visits.length} giai đoạn</p>
                </div>
              </button>

              <button
                type="button"
                title="Gen avatar (Robohash)"
                onClick={(e) => handleGenAvatar(e, p.id)}
                disabled={isGenerating}
                className="shrink-0 w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </button>
              </div>

              {isOpen && (
                <div className="pb-1 border-t border-sky-50/80">
                  {p.visits.map((v, idx) => {
                    const selected = p.id === activePatientId && idx === activeVisitIndex;
                    const risk = calculateRisk(v.patientData, lang);
                    const ldl = v.patientData.ldlChol;

                    return (
                      <button
                        key={v.id}
                        onClick={() => selectVisit(p.id, idx)}
                        className={`w-full text-left pl-10 pr-3 py-2 text-[10px] transition-colors cursor-pointer border-l-[3px] ${
                          selected
                            ? "bg-orange-50 border-orange-500 text-orange-900"
                            : "border-transparent text-slate-600 hover:bg-sky-50/80 hover:text-sky-800"
                        }`}
                      >
                        <span className="font-semibold block">Giai đoạn {idx + 1}</span>
                        <span className="text-[9px] opacity-80 block truncate">{v.visitDate}</span>
                        <span className="text-[9px] opacity-70">
                          LDL {ldl} · {risk.riskCategory}
                        </span>
                        {v.isFatalOutcome && (
                          <span className="text-[8px] text-rose-600 font-semibold">Kết cục</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
