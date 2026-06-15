"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { PaperReferencePanel } from "@/components/workspace/PaperReferencePanel";
import { PatientSidebar } from "@/components/workspace/PatientSidebar";
import { PatientStatusPanel } from "@/components/workspace/PatientStatusPanel";
import { Table4Section } from "@/components/workspace/Table4Section";

type RightTab = "status" | "reference";

export function TabPatients() {
  const [rightTab, setRightTab] = useState<RightTab>("status");

  return (
    <div className="flex flex-col gap-2 w-full h-full min-h-0">
      <div className="dash-card-blue px-4 py-2.5 shrink-0">
        <h1 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Hồ sơ bệnh nhân
        </h1>
        <p className="text-[10px] text-sky-100 mt-0.5">
          Chọn BN bên trái — tình trạng & đối chiếu ESC/EAS 2025 bên phải. Tính toán theo paper, không AI.
        </p>
      </div>

      <div className="flex flex-1 min-h-0 gap-3">
        {/* Trái: danh sách bệnh nhân */}
        <div className="w-[260px] shrink-0 min-h-0 flex flex-col">
          <PatientSidebar />
        </div>

        {/* Phải: tab nội dung */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-2">
          <div className="flex shrink-0 rounded-lg border border-sky-100 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setRightTab("status")}
              className={`flex-1 text-[10px] font-semibold py-2 cursor-pointer transition-colors ${
                rightTab === "status" ? "bg-sky-700 text-white" : "text-slate-600 hover:bg-sky-50"
              }`}
            >
              Tình trạng
            </button>
            <button
              type="button"
              onClick={() => setRightTab("reference")}
              className={`flex-1 text-[10px] font-semibold py-2 cursor-pointer transition-colors ${
                rightTab === "reference" ? "bg-sky-700 text-white" : "text-slate-600 hover:bg-sky-50"
              }`}
            >
              Đối chiếu ESC/EAS 2025
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-1">
            {rightTab === "status" && <PatientStatusPanel />}
            {rightTab === "reference" && <PaperReferencePanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
