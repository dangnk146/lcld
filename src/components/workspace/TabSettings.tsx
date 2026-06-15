"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Eye, FileText, Key, Loader2, Play, RotateCcw, Save, XCircle } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { testAgentModel, testAllAgentModels, type ModelTestResult } from "@/app/actions/test-models";
import {
  DEFAULT_PROMPTS,
  loadPromptOverrides,
  PROMPT_FILE_MAP,
  resetPromptOverride,
  savePromptOverride,
} from "@/lib/agents/prompts";
import { MASTER_AGENT, SPECIALIST_AGENTS } from "@/lib/agents/config";
import { useApp } from "@/context/AppContext";
import type { AgentKey } from "@/lib/types";

const ALL_AGENTS: { key: AgentKey; label: string; model: string; provider: string }[] = [
  ...SPECIALIST_AGENTS.map((a) => ({
    key: a.key as AgentKey,
    label: a.roleVi,
    model: a.model,
    provider: a.providerLabel,
  })),
  {
    key: "master" as AgentKey,
    label: MASTER_AGENT.roleVi,
    model: MASTER_AGENT.model,
    provider: MASTER_AGENT.providerLabel,
  },
];

export function TabSettings() {
  const {
    nvidiaApiKey,
    setNvidiaApiKey,
    saveNvidiaKey,
    nvidiaKeyStatus,
    promptOverrides,
    setPromptOverrides,
    lang,
  } = useApp();

  const [selectedBot, setSelectedBot] = useState<AgentKey>("cardiologist");
  const [draftPrompt, setDraftPrompt] = useState(DEFAULT_PROMPTS.cardiologist);
  const [promptView, setPromptView] = useState<"edit" | "preview">("edit");
  const [savedMsg, setSavedMsg] = useState("");
  const [testingKey, setTestingKey] = useState<AgentKey | "all" | null>(null);
  const [testResults, setTestResults] = useState<Partial<Record<AgentKey, ModelTestResult>>>({});

  useEffect(() => {
    const overrides = { ...loadPromptOverrides(), ...promptOverrides };
    setDraftPrompt(overrides[selectedBot] || DEFAULT_PROMPTS[selectedBot]);
    setPromptView("edit");
  }, [selectedBot, promptOverrides]);

  const handleSavePrompt = () => {
    savePromptOverride(selectedBot, draftPrompt);
    setPromptOverrides((prev) => ({ ...prev, [selectedBot]: draftPrompt }));
    setSavedMsg("Đã lưu prompt override (localStorage)");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const handleResetPrompt = () => {
    resetPromptOverride(selectedBot);
    setPromptOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedBot];
      return next;
    });
    setDraftPrompt(DEFAULT_PROMPTS[selectedBot]);
    setSavedMsg("Đã khôi phục prompt mặc định");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const runTest = async (key: AgentKey) => {
    setTestingKey(key);
    const result = await testAgentModel(key, "", nvidiaApiKey);
    setTestResults((prev) => ({ ...prev, [key]: result }));
    setTestingKey(null);
  };

  const runTestAll = async () => {
    setTestingKey("all");
    const results = await testAllAgentModels("", nvidiaApiKey);
    setTestResults(Object.fromEntries(results.map((r) => [r.key, r])));
    setTestingKey(null);
  };

  const fileInfo = PROMPT_FILE_MAP[selectedBot];

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {/* API Keys — lưu riêng từng key */}
      <section className="dash-card overflow-hidden">
        <div className="px-4 py-3 bg-sky-700 text-white flex items-center gap-2">
          <Key className="w-4 h-4" />
          <h2 className="text-sm font-semibold">Cấu hình API Key</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="border border-sky-100 rounded-lg p-3 space-y-2">
            <label className="block text-[10px] font-semibold text-sky-700 uppercase">NVIDIA API Key</label>
            <input
              type="password"
              value={nvidiaApiKey}
              onChange={(e) => setNvidiaApiKey(e.target.value)}
              placeholder="nvapi-..."
              className="w-full text-xs border border-sky-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveNvidiaKey}
                className="flex items-center gap-1.5 bg-sky-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-sky-800 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu NVIDIA
              </button>
              {nvidiaKeyStatus && (
                <span className="text-[11px] text-emerald-600 font-medium">{nvidiaKeyStatus}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Test models */}
      <section className="dash-card overflow-hidden">
        <div className="px-4 py-3 bg-sky-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <h2 className="text-sm font-semibold">Test Model</h2>
          </div>
          <button
            onClick={runTestAll}
            disabled={testingKey !== null}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
          >
            {testingKey === "all" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Test tất cả (6 bot)
          </button>
        </div>
        <div className="p-4 space-y-2">
          {ALL_AGENTS.map((a) => {
            const result = testResults[a.key];
            const isLoading = testingKey === a.key || testingKey === "all";

            return (
              <div
                key={a.key}
                className="flex flex-wrap items-center gap-2 py-2 border-b border-sky-50 last:border-0"
              >
                <div className="flex-1 min-w-[180px]">
                  <p className="text-[11px] font-semibold text-slate-800">{a.label}</p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {a.provider} · {a.model}
                  </p>
                </div>

                {result && (
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {result.ok ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-700 font-medium">{result.latencyMs}ms</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-600 truncate max-w-[200px]" title={result.error}>
                            {result.error}
                          </span>
                        </>
                      )}
                    </div>
                    {result.ok && result.preview && (
                      <div className="text-[9px] text-slate-500 max-w-[220px] truncate" title={result.preview}>
                        {result.preview}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => runTest(a.key)}
                  disabled={testingKey !== null}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-sky-700 border border-sky-200 hover:bg-sky-50 disabled:opacity-50 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Test
                </button>
              </div>
            );
          })}
          <p className="text-[9px] text-slate-400 pt-1">
            Gửi prompt ngắn tới từng model để kiểm tra key và kết nối hoạt động.
          </p>
        </div>
      </section>

      {/* Prompt editor */}
      <section className="dash-card overflow-hidden">
        <div className="px-4 py-3 bg-sky-800 text-white flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <h2 className="text-sm font-semibold">Cấu hình Prompt — 6 Bot AI</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {ALL_AGENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setSelectedBot(a.key)}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  selectedBot === a.key
                    ? "bg-sky-700 text-white shadow-sm"
                    : "bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-sky-900">{fileInfo.label}</p>
            <p className="text-[9px] font-mono text-sky-600 mt-0.5">{fileInfo.file}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPromptView("edit")}
              className={`flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                promptView === "edit"
                  ? "bg-sky-700 text-white"
                  : "bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() => setPromptView("preview")}
              className={`flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                promptView === "preview"
                  ? "bg-sky-700 text-white"
                  : "bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Xem Markdown
            </button>
          </div>

          {promptView === "edit" ? (
            <textarea
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              rows={14}
              className="w-full text-[11px] font-mono border border-sky-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 leading-relaxed"
            />
          ) : (
            <div className="min-h-[320px] max-h-[420px] overflow-y-auto scrollbar-thin border border-sky-100 rounded-lg px-4 py-3 bg-white">
              <MarkdownRenderer content={draftPrompt || "*Chưa có nội dung prompt.*"} />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSavePrompt}
              className="flex items-center gap-2 bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Lưu prompt
            </button>
            <button
              onClick={handleResetPrompt}
              className="flex items-center gap-2 bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục mặc định
            </button>
          </div>
          {savedMsg && <p className="text-xs text-emerald-600">{savedMsg}</p>}
        </div>
      </section>
    </div>
  );
}
