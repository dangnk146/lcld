"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TabAgents } from "@/components/workspace/TabAgents";
import { useApp } from "@/context/AppContext";

function AiAgentContent() {
  const searchParams = useSearchParams();
  const { setActivePatientId, setActiveVisitIndex, setAgentChats } = useApp();

  useEffect(() => {
    const patient = searchParams.get("patient");
    const visit = searchParams.get("visit");
    if (patient) {
      const visitIdx = visit ? parseInt(visit, 10) : 0;
      if (!isNaN(visitIdx)) {
        setActivePatientId(patient);
        setActiveVisitIndex(visitIdx);
        setAgentChats({});
      }
    }
  }, [searchParams, setActivePatientId, setActiveVisitIndex, setAgentChats]);

  return <TabAgents />;
}

export default function AiAgentPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Đang tải AI Agent...</div>}>
      <AiAgentContent />
    </Suspense>
  );
}
