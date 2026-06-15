import type { PatientData } from "@/app/actions";

export interface Visit {
  id: string;
  visitDate: string;
  patientData: PatientData;
  clinicalNotes: string;
  isFatalOutcome?: boolean;
}

export interface PatientRecord {
  id: string;
  patientName: string;
  status: "alive" | "deceased";
  visits: Visit[];
}

export type Lang = "vi" | "en";
export type PageSlug = "patients" | "ai-agent" | "settings" | "workspace" | "overview" | "mdt-analysis" | "specialists" | "reference" | "history";
export type SpecialistKey =
  | "cardiologist"
  | "lipidologist"
  | "endocrinologist";
export type AgentKey = SpecialistKey | "master";

export interface RiskAssessment {
  riskCategory: "low" | "moderate" | "high" | "very_high";
  reasons: string[];
  rowType: "low" | "moderate" | "high" | "very_high_primary" | "very_high_secondary";
  estimatedScore2: number;
}

export interface InputSeverity {
  severity: "safe" | "warning" | "danger";
  text: string;
  borderClass: string;
  textClass: string;
}
