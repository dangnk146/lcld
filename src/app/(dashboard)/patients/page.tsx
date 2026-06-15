"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function PatientsPage() {
  const router = useRouter();
  const { activePatientId } = useApp();

  useEffect(() => {
    router.replace(`/patients/${activePatientId || "patient1"}`);
  }, [activePatientId, router]);

  return (
    <div className="p-4 text-sm text-slate-500 flex items-center justify-center h-full">
      Đang chuyển hướng đến hồ sơ bệnh nhân...
    </div>
  );
}
