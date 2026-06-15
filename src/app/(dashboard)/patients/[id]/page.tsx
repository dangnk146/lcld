"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { TabPatients } from "@/components/workspace/TabPatients";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setActivePatientId, patients } = useApp();

  useEffect(() => {
    if (id && patients.some((p) => p.id === id)) {
      setActivePatientId(id);
    }
  }, [id, setActivePatientId, patients]);

  return (
    <div className="h-full min-h-0">
      <TabPatients />
    </div>
  );
}
