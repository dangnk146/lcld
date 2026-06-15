"use client";

import { useApp } from "@/context/AppContext";

export function ApiKeyPanel() {
  const {
    showKeyInput,
    nvidiaApiKey,
    setNvidiaApiKey,
    saveApiKey,
    keyStatus,
    translations,
    lang,
  } = useApp();

  if (!showKeyInput) return null;

  return (
    <div className="shrink-0 bg-sky-50 border-b border-sky-100 px-4 py-3">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] text-sky-800 font-medium">
          {lang === "vi"
            ? "Multi-Agent cần NVIDIA API Key (build.nvidia.com)"
            : "Multi-Agent needs an NVIDIA API key (build.nvidia.com)"}
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-semibold uppercase text-sky-600 mb-1">NVIDIA</label>
            <input
              type="password"
              placeholder="nvapi-..."
              value={nvidiaApiKey}
              onChange={(e) => setNvidiaApiKey(e.target.value)}
              className="w-full bg-white rounded-lg border border-sky-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <button
            onClick={saveApiKey}
            className="btn-accent text-xs px-5 py-2 rounded-lg"
          >
            {translations[lang].saveKey}
          </button>
        </div>
        {keyStatus && <p className="text-xs text-sky-700 font-medium">{keyStatus}</p>}
      </div>
    </div>
  );
}
