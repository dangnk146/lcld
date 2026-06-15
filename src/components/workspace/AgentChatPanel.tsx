"use client";

import { useRef, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { ChatMessage } from "@/app/actions";
import type { AgentKey } from "@/lib/types";

interface AgentChatPanelProps {
  agentKey: AgentKey;
  title: string;
  subtitle: string;
  gradient: string;
  messages: ChatMessage[];
  loading: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  compact?: boolean;
}

export function AgentChatPanel({
  title,
  subtitle,
  gradient,
  messages,
  loading,
  input,
  onInputChange,
  onSend,
  compact = false,
}: AgentChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend();
  };

  return (
    <div className={`flex flex-col rounded-xl border border-sky-100 bg-white shadow-sm overflow-hidden ${compact ? "min-h-[280px]" : "min-h-[360px]"}`}>
      <div className={`px-3 py-2 ${gradient} text-white shrink-0`}>
        <p className="text-[11px] font-black leading-tight">{title}</p>
        <p className="text-[9px] text-white/80 font-medium truncate">{subtitle}</p>
      </div>

      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2 ${compact ? "min-h-[140px] max-h-[220px]" : "min-h-[180px] max-h-[320px]"}`}
      >
        {messages.length === 0 && !loading && (
          <p className="text-[10px] text-slate-400 text-center py-6">Chưa có phân tích. Nhấn &quot;Tự động phân tích&quot; hoặc chat.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-2.5 py-2 ${
              m.role === "user"
                ? "bg-sky-50 text-sky-900 ml-4 border border-sky-100 text-[10px]"
                : "bg-white text-slate-700 mr-2 border border-sky-50"
            }`}
          >
            {m.role === "assistant" ? (
              <MarkdownRenderer content={m.content} compact={compact} />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Đang suy luận...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 flex gap-1.5 p-2 border-t border-sky-50 bg-sky-50/40">
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Hỏi chuyên gia..."
          disabled={loading}
          className="flex-1 text-[10px] rounded-lg border border-sky-100 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 p-1.5 rounded-lg bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
