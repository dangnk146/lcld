"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Sparkles, Zap } from "lucide-react";
import { runAgentChat, runSingleAgent } from "@/app/actions/multi-agent";
import { AgentChatPanel } from "@/components/workspace/AgentChatPanel";
import { PatientSidebar } from "@/components/workspace/PatientSidebar";
import { PatientStatusPanel } from "@/components/workspace/PatientStatusPanel";
import { MASTER_AGENT, SPECIALIST_AGENTS } from "@/lib/agents/config";
import { loadPromptOverrides } from "@/lib/agents/prompts";
import { useApp } from "@/context/AppContext";
import type { AgentKey, SpecialistKey } from "@/lib/types";

const SPECIALIST_HEADERS = [
  "bg-sky-600",
  "bg-sky-700",
  "bg-sky-800",
  "bg-sky-500",
  "bg-sky-900",
];

const EMPTY_INPUTS: Record<AgentKey, string> = {
  cardiologist: "",
  lipidologist: "",
  endocrinologist: "",
  nephrologist: "",
  pharmacologist: "",
  master: "",
};

export function TabAgents() {
  const {
    patient,
    activePatient,
    activeVisit,
    activePatientId,
    activeVisitIndex,
    apiKey,
    nvidiaApiKey,
    setShowKeyInput,
    agentChats,
    setAgentChats,
    agentLoading,
    setAgentLoading,
    promptOverrides,
  } = useApp();

  const [inputs, setInputs] = useState(EMPTY_INPUTS);
  const [autoRunning, setAutoRunning] = useState(false);
  const [error, setError] = useState("");
  const [leftTab, setLeftTab] = useState<"patients" | "status">("patients");
  const selectionRef = useRef(`${activePatientId}:${activeVisitIndex}`);

  const dossierLabel = `${activePatient.patientName} — Giai đoạn ${activeVisitIndex + 1}: ${activeVisit?.visitDate || ""}`;

  useEffect(() => {
    const key = `${activePatientId}:${activeVisitIndex}`;
    if (selectionRef.current === key) return;
    selectionRef.current = key;
    setAgentChats({});
    setError("");
  }, [activePatientId, activeVisitIndex, setAgentChats]);

  const setInput = (key: AgentKey, v: string) => setInputs((prev) => ({ ...prev, [key]: v }));

  const runAutoAnalysis = async () => {
    if (!nvidiaApiKey) {
      setShowKeyInput(true);
      setError("Cần NVIDIA API Key (tab Cấu hình).");
      return;
    }

    setAutoRunning(true);
    setError("");
    setAgentLoading(
      Object.fromEntries(
        [...SPECIALIST_AGENTS.map((a) => a.key), "master"].map((k) => [k, true])
      ) as Record<AgentKey, boolean>
    );

    const customPrompts = { ...loadPromptOverrides(), ...promptOverrides };
    const ctx = {
      clinicalNotes: activeVisit?.clinicalNotes,
      visitDate: activeVisit?.visitDate,
      customPrompts,
    };

    const specialistOutputs: Partial<Record<SpecialistKey, string>> = {};

    await Promise.all(
      SPECIALIST_AGENTS.map(async (agent) => {
        const result = await runSingleAgent(agent.key, patient, apiKey, nvidiaApiKey, ctx);
        if (result.content) {
          specialistOutputs[agent.key] = result.content;
          setAgentChats((prev) => ({
            ...prev,
            [agent.key]: [{ role: "assistant", content: result.content }],
          }));
        } else if (result.error) {
          setAgentChats((prev) => ({
            ...prev,
            [agent.key]: [{ role: "assistant", content: `Lỗi: ${result.error}` }],
          }));
        }
        setAgentLoading((prev) => ({ ...prev, [agent.key]: false }));
      })
    );

    const masterResult = await runSingleAgent("master", patient, apiKey, nvidiaApiKey, {
      ...ctx,
      specialistOutputs,
    });

    if (masterResult.content) {
      setAgentChats((prev) => ({
        ...prev,
        master: [{ role: "assistant", content: masterResult.content }],
      }));
    } else if (masterResult.error) {
      setAgentChats((prev) => ({
        ...prev,
        master: [{ role: "assistant", content: `Lỗi Master: ${masterResult.error}` }],
      }));
    }
    setAgentLoading((prev) => ({ ...prev, master: false }));
    setAutoRunning(false);
  };

  const sendChat = async (agentKey: AgentKey) => {
    const text = inputs[agentKey].trim();
    if (!text || agentLoading[agentKey]) return;
    if (!nvidiaApiKey) {
      setShowKeyInput(true);
      return;
    }

    const prev = agentChats[agentKey] || [];
    const newHistory = [...prev, { role: "user" as const, content: text }];
    setAgentChats((c) => ({ ...c, [agentKey]: newHistory }));
    setInput(agentKey, "");
    setAgentLoading((prev) => ({ ...prev, [agentKey]: true }));

    const customPrompts = { ...loadPromptOverrides(), ...promptOverrides };
    const result = await runAgentChat(agentKey, patient, newHistory, apiKey, nvidiaApiKey, {
      clinicalNotes: activeVisit?.clinicalNotes,
      visitDate: activeVisit?.visitDate,
      customPrompts,
    });

    setAgentLoading((prev) => ({ ...prev, [agentKey]: false }));

    if (result.content) {
      setAgentChats((c) => ({
        ...c,
        [agentKey]: [...newHistory, { role: "assistant", content: result.content }],
      }));
    } else {
      setAgentChats((c) => ({
        ...c,
        [agentKey]: [...newHistory, { role: "assistant", content: `Lỗi: ${result.error}` }],
      }));
    }
  };

  return (
    <div className="flex h-full min-h-0 gap-3">
      {/* Trái: tab BN / tình trạng */}
      <div className="w-[260px] shrink-0 flex flex-col min-h-0 h-full gap-2">
        <div className="flex shrink-0 rounded-lg border border-sky-100 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setLeftTab("patients")}
            className={`flex-1 text-[10px] font-semibold py-2 cursor-pointer transition-colors ${
              leftTab === "patients" ? "bg-sky-700 text-white" : "text-slate-600 hover:bg-sky-50"
            }`}
          >
            Hồ sơ BN
          </button>
          <button
            type="button"
            onClick={() => setLeftTab("status")}
            className={`flex-1 text-[10px] font-semibold py-2 cursor-pointer transition-colors ${
              leftTab === "status" ? "bg-sky-700 text-white" : "text-slate-600 hover:bg-sky-50"
            }`}
          >
            Tình trạng
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {leftTab === "patients" ? (
            <PatientSidebar />
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin">
              <PatientStatusPanel />
            </div>
          )}
        </div>
      </div>

      {/* Giữa: chatbot — một vùng scroll duy nhất */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2">
        <div className="dash-card-violet px-4 py-2.5 flex items-center gap-3 shrink-0">
          <Sparkles className="w-4 h-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate">{dossierLabel}</p>
            <p className="text-[9px] text-sky-100 font-mono truncate">
              {activeVisit?.id} · Multi-Agent MDT
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-1 space-y-3">
          <AgentChatPanel
            agentKey="master"
            title={MASTER_AGENT.roleVi}
            subtitle={`${MASTER_AGENT.providerLabel} · ${MASTER_AGENT.model}`}
            gradient="bg-sky-900"
            messages={agentChats.master || []}
            loading={!!agentLoading.master}
            input={inputs.master}
            onInputChange={(v) => setInput("master", v)}
            onSend={() => sendChat("master")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
            {SPECIALIST_AGENTS.map((agent, i) => (
              <AgentChatPanel
                key={agent.key}
                agentKey={agent.key}
                title={agent.roleVi}
                subtitle={`${agent.providerLabel} · ${agent.model}`}
                gradient={SPECIALIST_HEADERS[i]}
                messages={agentChats[agent.key] || []}
                loading={!!agentLoading[agent.key]}
                input={inputs[agent.key]}
                onInputChange={(v) => setInput(agent.key, v)}
                onSend={() => sendChat(agent.key)}
                compact
              />
            ))}
          </div>
        </div>
      </div>

      {/* Phải: tự động phân tích */}
      <aside className="w-[150px] shrink-0 flex flex-col gap-2 min-h-0">
        <button
          onClick={runAutoAnalysis}
          disabled={autoRunning}
          className="shrink-0 flex flex-col items-center gap-2 w-full py-4 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-sm disabled:opacity-60 cursor-pointer transition-colors"
        >
          {autoRunning ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Zap className="w-6 h-6" />
          )}
          Tự động phân tích
        </button>
        <p className="text-[9px] text-slate-500 text-center leading-relaxed shrink-0">
          Giao hồ sơ giai đoạn {activeVisitIndex + 1} cho 5 bot song song, sau đó Master tổng hợp.
        </p>
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-1">
          {SPECIALIST_AGENTS.map((a, i) => (
            <div
              key={a.key}
              className={`text-[8px] font-semibold px-2 py-1 rounded-lg text-center text-white ${SPECIALIST_HEADERS[i]} ${
                agentLoading[a.key] ? "animate-pulse" : agentChats[a.key]?.length ? "ring-2 ring-orange-300" : "opacity-50"
              }`}
            >
              {a.roleVi.split(" ").slice(-1)[0]}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
