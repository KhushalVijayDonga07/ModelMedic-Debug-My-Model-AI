export type Plan = "FREE" | "PRO" | "TEAM";
export type Framework = "PYTORCH" | "KERAS" | "TENSORFLOW" | "SKLEARN" | "OTHER";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ChatRole = "USER" | "ASSISTANT";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  plan: Plan;
  diagnosesUsed: number;
  createdAt: string;
}

export interface Diagnosis {
  id: string;
  userId: string;
  title: string;
  modelArchitecture: string;
  trainingLogs: string;
  framework: Framework;
  issuesFound: unknown[];
  fixSuggestions: unknown[];
  severity: Severity;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  diagnosisId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  razorpaySubId: string;
  plan: Plan;
  status: string;
  currentPeriodEnd: string;
}