"use client";

import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface DossierPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (patientId: string, visitIndex: number) => void;
}

export function DossierPickerModal({ open, onClose, onSelect }: DossierPickerModalProps) {
  const { patients, activePatientId, activeVisitIndex } = useApp();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-sky-900/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-sky-100 bg-sky-700 text-white">
          <h2 className="text-sm font-black">Chọn hồ sơ & giai đoạn</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {patients.map((p) => (
            <div key={p.id} className="border border-sky-100 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-sky-50 border-b border-sky-100">
                <p className="text-xs font-bold text-slate-800">{p.patientName}</p>
                <p className="text-[9px] text-slate-500">
                  {p.visits.length} giai đoạn · {p.status === "deceased" ? "Đã tử vong" : "Đang theo dõi"}
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {p.visits.map((v, idx) => {
                  const selected = p.id === activePatientId && idx === activeVisitIndex;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        onSelect(p.id, idx);
                        onClose();
                      }}
                      className={`w-full text-left px-3 py-2.5 hover:bg-sky-50 transition-colors cursor-pointer ${
                        selected ? "bg-sky-50 border-l-4 border-sky-700" : ""
                      }`}
                    >
                      <p className="text-[11px] font-semibold text-slate-800">
                        Giai đoạn {idx + 1}: {v.visitDate}
                      </p>
                      <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5">{v.clinicalNotes}</p>
                      <p className="text-[9px] text-sky-600 mt-1 font-mono">ID: {v.id}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
