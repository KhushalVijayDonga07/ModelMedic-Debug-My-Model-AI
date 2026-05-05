import { anthropic } from "@/lib/anthropic";
import { DIAGNOSIS_SYSTEM_PROMPT } from "@/lib/prompts/diagnosis-prompt";
import { z } from "zod";

export type Issue = {
  id: string;
  name: string;
  confidence: number;
  description: string;
  evidence: string;
};

export type Fix = {
  issueId: string;
  title: string;
  explanation: string;
  codeSnippet: string;
  language: string;
};

export type DiagnosisInput = {
  modelArchitecture: string;
  trainingLogs: string;
  framework: string;
};

export type DiagnosisResult = {
  issues: Issue[];
  fixes: Fix[];
  severity: string;
  summary: string;
};

const issueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  confidence: z.number().min(0).max(100),
  description: z.string().min(1),
  evidence: z.string().min(1)
});

const fixSchema = z.object({
  issueId: z.string().min(1),
  title: z.string().min(1),
  explanation: z.string().min(1),
  codeSnippet: z.string().min(1),
  language: z.string().min(1)
});

const diagnosisSchema = z.object({
  issues: z.array(issueSchema),
  fixes: z.array(fixSchema),
  severity: z.string().min(1),
  summary: z.string().min(1)
});

const extractJson = (raw: string) => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return raw;
  }
  return raw.slice(start, end + 1);
};

export async function runDiagnosisEngine(
  input: DiagnosisInput
): Promise<DiagnosisResult> {
  const userPrompt = `Model architecture:\n${input.modelArchitecture}\n\nTraining logs:\n${input.trainingLogs}\n\nFramework: ${input.framework}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    temperature: 0.2,
    system: DIAGNOSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }]
  });

  const text = response.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("\n");

  const parsed = JSON.parse(extractJson(text));
  const validated = diagnosisSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("Diagnosis response failed validation.");
  }

  return validated.data;
}