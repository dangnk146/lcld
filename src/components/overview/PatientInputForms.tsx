"use client";

import type { PatientData } from "@/app/actions";
import { Activity, Info, ShieldAlert, Sparkles, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getInputSeverity } from "@/lib/risk";

export function PatientInputForms() {
  const {
    lang,
    patient,
    setPatient,
    activeInputTab,
    setActiveInputTab,
    calculatedNonHdlVal,
    translations,
  } = useApp();

  const t = translations[lang];
  const tcInfo = getInputSeverity("totalChol", patient.totalChol, patient, lang);
  const hdlInfo = getInputSeverity("hdlChol", patient.hdlChol, patient, lang);
  const ldlInfo = getInputSeverity("ldlChol", patient.ldlChol, patient, lang);
  const tgInfo = getInputSeverity("triglycerides", patient.triglycerides, patient, lang);
  const sbpInfo = getInputSeverity("sbp", patient.sbp, patient, lang);
  const dbpInfo = getInputSeverity("dbp", patient.dbp, patient, lang);

  const tabs = [
    { id: "demographics" as const, icon: "👤", label: lang === "vi" ? "Chung" : "Profile", active: "bg-blue-500 text-white" },
    { id: "lipids" as const, icon: "🧪", label: lang === "vi" ? "Lipid" : "Lipids", active: "bg-violet-500 text-white" },
    { id: "lifestyle" as const, icon: "💓", label: "BP", active: "bg-rose-500 text-white" },
    { id: "conditions" as const, icon: "🏥", label: lang === "vi" ? "Bệnh" : "Cond.", active: "bg-amber-500 text-white" },
    { id: "modifiers" as const, icon: "⚡", label: "Mod.", active: "bg-cyan-500 text-white" },
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-1 overflow-x-auto text-[10px] font-bold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveInputTab(tab.id)}
            className={`py-1.5 px-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeInputTab === tab.id ? `${tab.active} shadow-md` : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeInputTab === "demographics" && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase mb-4 flex items-center gap-1.5">
            <User className="w-4 h-4 text-zinc-500" />
            {t.demographics}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              value={patient.name}
              onChange={(e) => setPatient({ ...patient, name: e.target.value })}
              placeholder={t.name}
              className="w-full border border-zinc-250 rounded-lg px-3 py-1.5 text-xs"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={patient.age}
                onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                placeholder={t.age}
                className="border border-zinc-250 rounded-lg px-3 py-1.5 text-xs"
              />
              <select
                value={patient.sex}
                onChange={(e) => setPatient({ ...patient, sex: e.target.value as "male" | "female" })}
                className="border border-zinc-250 rounded-lg px-3 py-1.5 text-xs"
              >
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
              </select>
            </div>
            <select
              value={patient.riskRegion}
              onChange={(e) =>
                setPatient({
                  ...patient,
                  riskRegion: e.target.value as PatientData["riskRegion"],
                })
              }
              className="border border-zinc-250 rounded-lg px-3 py-1.5 text-xs"
            >
              <option value="low">{t.low}</option>
              <option value="moderate">{t.moderate}</option>
              <option value="high">{t.high}</option>
              <option value="very_high">{t.very_high}</option>
            </select>
          </div>
        </div>
      )}

      {activeInputTab === "lipids" && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase mb-4">{t.lipidPanel}</h3>
          <div className="flex gap-2 mb-3">
            {(["mmol", "mg"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setPatient({ ...patient, unit: u })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                  patient.unit === u ? "bg-black text-white border-black" : "bg-white border-zinc-200"
                }`}
              >
                {u}/L
              </button>
            ))}
          </div>
          {(
            [
              ["totalChol", patient.totalChol, tcInfo],
              ["hdlChol", patient.hdlChol, hdlInfo],
              ["ldlChol", patient.ldlChol, ldlInfo],
              ["triglycerides", patient.triglycerides, tgInfo],
            ] as const
          ).map(([field, val, info]) => (
            <div key={field} className="mb-3">
              <label className="text-[11px] font-semibold text-zinc-500">{t[field]}</label>
              <input
                type="number"
                step="0.1"
                value={val}
                onChange={(e) =>
                  setPatient({ ...patient, [field]: parseFloat(e.target.value) || 0 })
                }
                className={`w-full mt-1 border rounded-lg px-3 py-1.5 text-xs ${
                  info.severity === "danger" ? "border-rose-400 bg-rose-50/20" : "border-zinc-250"
                }`}
              />
              <p className="text-[9px] text-zinc-400 mt-1">{info.text}</p>
            </div>
          ))}
          <div className="p-3 bg-zinc-50 rounded-lg border flex gap-2">
            <Info className="w-4 h-4 shrink-0 text-zinc-500" />
            <p className="text-[10px] text-zinc-600">
              <span className="font-bold">{t.calculatedNonHdl}: </span>
              {calculatedNonHdlVal} {patient.unit}/L
            </p>
          </div>
        </div>
      )}

      {activeInputTab === "lifestyle" && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            {t.bpAndLifestyle}
          </h3>
          {(
            [
              ["sbp", patient.sbp, sbpInfo],
              ["dbp", patient.dbp, dbpInfo],
            ] as const
          ).map(([field, val, info]) => (
            <div key={field} className="mb-3">
              <label className="text-[11px] font-semibold text-zinc-500">{t[field]}</label>
              <input
                type="number"
                value={val}
                onChange={(e) =>
                  setPatient({ ...patient, [field]: parseInt(e.target.value) || 0 })
                }
                className="w-full mt-1 border border-zinc-250 rounded-lg px-3 py-1.5 text-xs"
              />
              <p className="text-[9px] text-zinc-400 mt-1">{info.text}</p>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setPatient({ ...patient, smokingStatus: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                patient.smokingStatus ? "bg-black text-white" : "bg-white border-zinc-200"
              }`}
            >
              {t.smoker}
            </button>
            <button
              onClick={() => setPatient({ ...patient, smokingStatus: false })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                !patient.smokingStatus ? "bg-black text-white" : "bg-white border-zinc-200"
              }`}
            >
              {t.nonSmoker}
            </button>
          </div>
        </div>
      )}

      {activeInputTab === "conditions" && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase mb-4 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            {t.highRiskConditions}
          </h3>
          <label className="flex items-center justify-between mb-3 text-[11px]">
            {t.hasAscvd}
            <input
              type="checkbox"
              checked={patient.hasAscvd}
              onChange={(e) => setPatient({ ...patient, hasAscvd: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between mb-3 text-[11px]">
            {t.diabetes}
            <select
              value={patient.diabetes}
              onChange={(e) =>
                setPatient({
                  ...patient,
                  diabetes: e.target.value as PatientData["diabetes"],
                })
              }
              className="border rounded px-2 py-1 text-xs"
            >
              <option value="none">{lang === "vi" ? "Không" : "None"}</option>
              <option value="t1dm">T1DM</option>
              <option value="t2dm">T2DM</option>
            </select>
          </label>
          <label className="flex items-center justify-between mb-3 text-[11px]">
            {t.ckd}
            <select
              value={patient.ckd}
              onChange={(e) =>
                setPatient({ ...patient, ckd: e.target.value as PatientData["ckd"] })
              }
              className="border rounded px-2 py-1 text-xs"
            >
              <option value="none">None</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </label>
          <label className="flex items-center justify-between text-[11px]">
            {t.fh}
            <input
              type="checkbox"
              checked={patient.hasFh}
              onChange={(e) => setPatient({ ...patient, hasFh: e.target.checked })}
            />
          </label>
        </div>
      )}

      {activeInputTab === "modifiers" && (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            {t.modifiers}
          </h3>
          {(
            [
              ["hasSubclinicalPlaque", t.hasSubclinicalPlaque],
              ["hasPrematureFamilyHistory", t.hasPrematureFamilyHistory],
              ["hasLpaElevated", t.hasLpaElevated],
              ["hasHiv", t.hasHiv],
              ["hasCancerToxicityRisk", t.hasCancerToxicityRisk],
              ["useDietarySupplements", t.useDietarySupplements],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="flex items-center justify-between mb-3 text-[11px]">
              {label}
              <input
                type="checkbox"
                checked={patient[field]}
                onChange={(e) => setPatient({ ...patient, [field]: e.target.checked })}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
