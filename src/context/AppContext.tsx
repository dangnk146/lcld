"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { type ChatMessage, type PatientData } from "@/app/actions";
import { initialPatients } from "@/lib/patients";
import { calculateRisk, getLdlColumnIndex, getLdlGoal, getRowIndex } from "@/lib/risk";
import { t } from "@/lib/translations";
import { loadPromptOverrides } from "@/lib/agents/prompts";
import { loadPatientAvatars, savePatientAvatar } from "@/lib/patient-avatars";
import type { AgentKey, Lang, PatientRecord, SpecialistKey } from "@/lib/types";
import { buildClinicalSummary } from "@/lib/agents/clinical-summary";
import { getEffectivePrompt } from "@/lib/agents/prompts";

interface SpecialistResults {
  cardiologist?: string;
  lipidologist?: string;
  endocrinologist?: string;
  nephrologist?: string;
  pharmacologist?: string;
}

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  showKeyInput: boolean;
  setShowKeyInput: (show: boolean) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
  patients: PatientRecord[];
  setPatients: React.Dispatch<React.SetStateAction<PatientRecord[]>>;
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  activeVisitIndex: number;
  setActiveVisitIndex: (index: number) => void;
  activePatient: PatientRecord;
  activeVisit: PatientRecord["visits"][number];
  patient: PatientData;
  setPatient: React.Dispatch<React.SetStateAction<PatientData>>;
  assessment: ReturnType<typeof calculateRisk>;
  colIdx: number;
  rowIdx: number;
  targetGoalMmol: number;
  targetGoalMg: number;
  currentValDisp: number;
  goalValDisp: number;
  reductionNeededPct: number;
  chatHistory: ChatMessage[];
  userInput: string;
  setUserInput: (v: string) => void;
  loadingAi: boolean;
  aiError: string;
  specialistResults: SpecialistResults | null;
  setSpecialistResults: React.Dispatch<React.SetStateAction<SpecialistResults | null>>;
  activeSpecialistTab: SpecialistKey | null;
  setActiveSpecialistTab: (tab: SpecialistKey | null) => void;
  activeInputTab: "demographics" | "lipids" | "lifestyle" | "conditions" | "modifiers";
  setActiveInputTab: (tab: "demographics" | "lipids" | "lifestyle" | "conditions" | "modifiers") => void;
  agentChats: Partial<Record<AgentKey, ChatMessage[]>>;
  setAgentChats: React.Dispatch<React.SetStateAction<Partial<Record<AgentKey, ChatMessage[]>>>>;
  agentLoading: Partial<Record<AgentKey, boolean>>;
  setAgentLoading: React.Dispatch<React.SetStateAction<Partial<Record<AgentKey, boolean>>>>;
  promptOverrides: Partial<Record<AgentKey, string>>;
  setPromptOverrides: React.Dispatch<React.SetStateAction<Partial<Record<AgentKey, string>>>>;
  patientAvatars: Record<string, string>;
  setPatientAvatar: (patientId: string, dataUrl: string) => void;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  triggerAiAudit: () => Promise<void>;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  downloadReport: () => void;
  copyReportToClipboard: () => void;
  calculatedNonHdlVal: string;
  translations: typeof t;
}

const AppContext = createContext<AppContextValue | null>(null);

const PROPAGATED_PATIENT_FIELDS: (keyof PatientData)[] = [
  "riskRegion",
  "smokingStatus",
  "sbp",
  "dbp",
  "totalChol",
  "hdlChol",
  "ldlChol",
  "triglycerides",
  "unit",
  "hasAscvd",
  "ascvdType",
  "diabetes",
  "dmDuration",
  "dmTargetOrganDamage",
  "dmRiskFactorsCount",
  "ckd",
  "hasFh",
  "fhHasMajorRiskFactor",
  "hasSubclinicalPlaque",
  "hasPrematureFamilyHistory",
  "hasLpaElevated",
  "hasHiv",
  "hasCancerToxicityRisk",
  "useDietarySupplements",
];

function patientDataEqual(a: PatientData, b: PatientData): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function propagateToFutureVisits(base: PatientData, target: PatientData): PatientData {
  const patch = Object.fromEntries(
    PROPAGATED_PATIENT_FIELDS.map((key) => [key, base[key]])
  ) as Partial<PatientData>;
  return { ...target, ...patch };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("vi");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [aiModel, setAiModel] = useState("openclaw");
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [activePatientId, setActivePatientId] = useState("patient1");
  const [activeVisitIndex, setActiveVisitIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");
  const [specialistResults, setSpecialistResults] = useState<SpecialistResults | null>(null);
  const [activeSpecialistTab, setActiveSpecialistTab] = useState<SpecialistKey | null>(null);
  const [activeInputTab, setActiveInputTab] = useState<
    "demographics" | "lipids" | "lifestyle" | "conditions" | "modifiers"
  >("demographics");
  const [agentChats, setAgentChats] = useState<Partial<Record<AgentKey, ChatMessage[]>>>({});
  const [agentLoading, setAgentLoading] = useState<Partial<Record<AgentKey, boolean>>>({});
  const [promptOverrides, setPromptOverrides] = useState<Partial<Record<AgentKey, string>>>({});
  const [patientAvatars, setPatientAvatars] = useState<Record<string, string>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const patientsRef = useRef(patients);
  patientsRef.current = patients;

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const activeVisit = activePatient.visits[activeVisitIndex] || activePatient.visits[0];
  const [patient, setPatient] = useState<PatientData>(activeVisit.patientData);

  useEffect(() => {
    setPromptOverrides(loadPromptOverrides());
    setPatientAvatars(loadPatientAvatars());
  }, []);

  const setPatientAvatarFn = (patientId: string, dataUrl: string) => {
    savePatientAvatar(patientId, dataUrl);
    setPatientAvatars((prev) => ({ ...prev, [patientId]: dataUrl }));
  };

  // Chỉ load patient khi đổi BN / giai đoạn — không phụ thuộc `patients` để tránh vòng lặp
  useEffect(() => {
    const freshPatient = patientsRef.current.find((p) => p.id === activePatientId);
    const freshVisit = freshPatient?.visits[activeVisitIndex];
    if (!freshVisit) return;
    setPatient((prev) =>
      patientDataEqual(prev, freshVisit.patientData) ? prev : freshVisit.patientData
    );
  }, [activePatientId, activeVisitIndex]);

  // Ghi patient vào hồ sơ chỉ khi dữ liệu thực sự thay đổi
  useEffect(() => {
    setPatients((prevPatients) => {
      const record = prevPatients.find((p) => p.id === activePatientId);
      const stored = record?.visits[activeVisitIndex]?.patientData;
      if (stored && patientDataEqual(stored, patient)) return prevPatients;

      return prevPatients.map((p) => {
        if (p.id !== activePatientId) return p;
        return {
          ...p,
          visits: p.visits.map((v, idx) => {
            if (idx === activeVisitIndex) return { ...v, patientData: patient };
            if (idx > activeVisitIndex) {
              return { ...v, patientData: propagateToFutureVisits(patient, v.patientData) };
            }
            return v;
          }),
        };
      });
    });
  }, [patient, activePatientId, activeVisitIndex]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingAi]);

  const assessment = calculateRisk(patient, lang);
  const colIdx = getLdlColumnIndex(patient);
  const rowIdx = getRowIndex(assessment.rowType);
  const targetGoalMmol = getLdlGoal(assessment.riskCategory);
  const targetGoalMg = Math.round(targetGoalMmol * 38.67);
  const currentLdlMmol = patient.unit === "mg" ? patient.ldlChol / 38.67 : patient.ldlChol;
  const currentLdlMg = patient.unit === "mmol" ? Math.round(patient.ldlChol * 38.67) : patient.ldlChol;
  const currentValDisp = patient.unit === "mmol" ? patient.ldlChol : currentLdlMg;
  const goalValDisp = patient.unit === "mmol" ? targetGoalMmol : targetGoalMg;
  const reductionNeededPct =
    currentLdlMmol > targetGoalMmol
      ? Math.round(((currentLdlMmol - targetGoalMmol) / currentLdlMmol) * 100)
      : 0;

  const triggerAiAudit = async () => {
    setLoadingAi(true);
    setAiError("");
    setChatHistory([{ role: "assistant", content: "" }]);
    setSpecialistResults(null);
    setActiveSpecialistTab(null);

    const clinicalSummary = buildClinicalSummary(patient, {
      clinicalNotes: activeVisit?.clinicalNotes,
      visitDate: activeVisit?.visitDate,
    });
    const prompt = getEffectivePrompt("master", promptOverrides);

    try {
      const res = await fetch("/api/openclaw/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "main",
          payload: {
            model: "openclaw",
            stream: true,
            temperature: 0.25,
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: clinicalSummary }
            ]
          }
        })
      });

      if (!res.ok) throw new Error(`Lỗi kết nối OpenClaw: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let content = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices?.[0]?.delta;
                const agent = data.agent || "master";
                
                if (delta?.content) {
                  const textToAppend = agent !== "master" && !content.includes(`[**${agent}**]:`)
                    ? `\n\n[**${agent}**]: ${delta.content}`
                    : delta.content;
                  content += textToAppend;
                  setChatHistory([{ role: "assistant", content }]);
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err: any) {
      setAiError(err.message || "Có lỗi xảy ra khi phân tích.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: userInput }];
    setChatHistory([...newHistory, { role: "assistant", content: "" }]);
    setUserInput("");
    setLoadingAi(true);
    setAiError("");

    const clinicalSummary = buildClinicalSummary(patient, {
      clinicalNotes: activeVisit?.clinicalNotes,
      visitDate: activeVisit?.visitDate,
    });
    const prompt = getEffectivePrompt("master", promptOverrides);

    try {
      const res = await fetch("/api/openclaw/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "main",
          payload: {
            model: "openclaw",
            stream: true,
            temperature: 0.25,
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: `${clinicalSummary}\n\nĐây là lịch sử trao đổi. Bạn hãy tiếp tục trả lời câu hỏi mới nhất của người dùng:` },
              ...newHistory
            ]
          }
        })
      });

      if (!res.ok) throw new Error(`Lỗi kết nối OpenClaw: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let content = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices?.[0]?.delta;
                const agent = data.agent || "master";
                
                if (delta?.content) {
                  const textToAppend = agent !== "master" && !content.includes(`[**${agent}**]:`)
                    ? `\n\n[**${agent}**]: ${delta.content}`
                    : delta.content;
                  content += textToAppend;
                  setChatHistory([...newHistory, { role: "assistant", content }]);
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err: any) {
      setAiError(err.message || "Có lỗi xảy ra khi trao đổi.");
    } finally {
      setLoadingAi(false);
    }
  };

  const downloadReport = () => {
    if (chatHistory.length === 0) return;
    const element = document.createElement("a");
    const file = new Blob([chatHistory[0].content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `CardioShield_Report_${patient.name || "Patient"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyReportToClipboard = () => {
    if (chatHistory.length === 0) return;
    navigator.clipboard.writeText(chatHistory[0].content);
    alert(t[lang].copied);
  };

  const calculatedNonHdlVal = (patient.totalChol - patient.hdlChol).toFixed(2);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        showKeyInput,
        setShowKeyInput,
        aiModel,
        setAiModel,
        patients,
        setPatients,
        activePatientId,
        setActivePatientId,
        activeVisitIndex,
        setActiveVisitIndex,
        activePatient,
        activeVisit,
        patient,
        setPatient,
        assessment,
        colIdx,
        rowIdx,
        targetGoalMmol,
        targetGoalMg,
        currentValDisp,
        goalValDisp,
        reductionNeededPct,
        chatHistory,
        userInput,
        setUserInput,
        loadingAi,
        aiError,
        specialistResults,
        setSpecialistResults,
        activeSpecialistTab,
        setActiveSpecialistTab,
        activeInputTab,
        setActiveInputTab,
        agentChats,
        setAgentChats,
        agentLoading,
        setAgentLoading,
        promptOverrides,
        setPromptOverrides,
        patientAvatars,
        setPatientAvatar: setPatientAvatarFn,
        chatBottomRef,
        triggerAiAudit,
        handleSendMessage,
        downloadReport,
        copyReportToClipboard,
        calculatedNonHdlVal,
        translations: t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
