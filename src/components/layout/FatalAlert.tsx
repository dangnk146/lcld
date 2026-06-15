"use client";

import { AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function FatalAlert() {
  const { activeVisit } = useApp();
  if (!activeVisit?.isFatalOutcome) return null;

  return (
    <div className="bg-rose-600 border border-rose-700 rounded-lg p-4 text-white shadow-sm flex flex-col md:flex-row items-center gap-3 animate-pulse">
      <AlertTriangle className="w-5 h-5 shrink-0 text-rose-100" />
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider">Cảnh báo lâm sàng: Bệnh nhân đã tử vong</h3>
        <p className="text-[10px] text-rose-100 mt-0.5 leading-relaxed">
          Bệnh nhân đã tử vong đột ngột do Nhồi máu cơ tim cấp diện rộng tái phát vào tuần 36.
          Hồ sơ lâm sàng đã đóng để phục vụ nghiên cứu và lưu trữ lịch sử bệnh án.
        </p>
      </div>
    </div>
  );
}
