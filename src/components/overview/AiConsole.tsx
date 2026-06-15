"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  Copy,
  Download,
  Key,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useApp } from "@/context/AppContext";

export function AiConsole() {
  const {
    lang,
    apiKey,
    setShowKeyInput,
    chatHistory,
    userInput,
    setUserInput,
    loadingAi,
    aiError,
    chatBottomRef,
    triggerAiAudit,
    handleSendMessage,
    downloadReport,
    copyReportToClipboard,
    translations,
  } = useApp();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="dash-card-cyan px-3 py-2 flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" />
          {translations[lang].aiAssistant}
        </h2>
        {chatHistory.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={copyReportToClipboard} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500" title={translations[lang].copy}>
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={downloadReport} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500" title={translations[lang].download}>
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-gradient-to-b from-cyan-50 to-slate-50 border border-cyan-200/50 rounded-xl p-3 flex flex-col overflow-y-auto min-h-[200px]">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800 mb-1.5">
              {lang === "vi" ? "Bác sĩ ảo AI đã sẵn sàng" : "AI Clinical Auditor Ready"}
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              {apiKey ? translations[lang].aiWelcome : translations[lang].aiWelcome}
            </p>
            {!apiKey && (
              <button
                onClick={() => setShowKeyInput(true)}
                className="mt-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-1.5 rounded-lg font-bold"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{lang === "vi" ? "Nhập OpenRouter API Key" : "Enter API Key"}</span>
              </button>
            )}
            {apiKey && (
              <button
                onClick={triggerAiAudit}
                disabled={loadingAi}
                className="mt-6 flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs px-5 py-3 rounded-lg cursor-pointer disabled:opacity-50"
              >
                {loadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                <span>{translations[lang].runAiBtn}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 px-1">
                  {msg.role === "user" ? "Doctor" : "AI Clinical Consultant (ESC 2025)"}
                </div>
                <div
                  className={`text-xs p-3.5 rounded-2xl max-w-[90%] leading-relaxed border shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white border-transparent rounded-tr-none"
                      : "bg-white text-zinc-800 border-zinc-200 rounded-tl-none"
                  }`}
                >
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {loadingAi && (
              <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-2xl p-4 w-[75%] shadow-sm">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span className="text-xs text-zinc-500 animate-pulse">{translations[lang].aiLoading}</span>
              </div>
            )}

            {aiError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {chatHistory.length > 0 && (
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder={translations[lang].askAiPlaceholder}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={loadingAi}
            className="flex-1 bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loadingAi || !userInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      <p className="mt-3 text-[10px] text-zinc-500 text-center">
        {lang === "vi" ? "Phân tích Multi-Agent (5 model khác nhau) tại " : "Full Multi-Agent analysis (5 models) at "}
        <Link href="/mdt-analysis" className="text-violet-600 font-bold hover:underline">
          /mdt-analysis
        </Link>
      </p>

      {chatHistory.length > 0 && (
        <button
          onClick={triggerAiAudit}
          disabled={loadingAi}
          className="mt-3 self-center flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-600 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? "animate-spin" : ""}`} />
          <span>{lang === "vi" ? "Chạy lại toàn bộ chẩn đoán" : "Recalculate AI analysis"}</span>
        </button>
      )}
    </div>
  );
}
