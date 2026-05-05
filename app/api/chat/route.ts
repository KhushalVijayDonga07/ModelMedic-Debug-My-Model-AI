import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const historySchema = z.array(
  z.object({
    role: z.enum(["USER", "ASSISTANT"]),
    content: z.string().min(1)
  })
);

const requestSchema = z.object({
  diagnosisId: z.string().min(1),
  message: z.string().min(1),
  history: historySchema.optional().default([])
});

type ErrorResponse = {
  error: string;
  details?: unknown;
};

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json<ErrorResponse>({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = requestSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json<ErrorResponse>(
      { error: "Invalid request", details: payload.error.flatten() },
      { status: 400 }
    );
  }

  const diagnosis = await prisma.diagnosis.findFirst({
    where: { id: payload.data.diagnosisId, user: { clerkId: userId } },
    include: { user: true }
  });

  if (!diagnosis) {
    return NextResponse.json<ErrorResponse>({ error: "Diagnosis not found" }, { status: 404 });
  }

  await prisma.chatMessage.create({
    data: {
      diagnosisId: diagnosis.id,
      role: "USER",
      content: payload.data.message
    }
  });

  const systemPrompt = `You are ModelMedic, an ML debugging assistant.\n\nModel architecture:\n${diagnosis.modelArchitecture}\n\nTraining logs:\n${diagnosis.trainingLogs}\n\nInitial diagnosis:\n${JSON.stringify({
    issues: diagnosis.issuesFound,
    fixes: diagnosis.fixSuggestions,
    severity: diagnosis.severity
  })}\n\nRespond with helpful, concise guidance. Provide exact code snippets when possible.`;

  const messages = [
    ...payload.data.history.map((item) => ({
      role: item.role === "USER" ? "user" : "assistant",
      content: item.content
    })),
    { role: "user", content: payload.data.message }
  ] as const;

  const result = await streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
    onFinish: async ({ text }) => {
      await prisma.chatMessage.create({
        data: {
          diagnosisId: diagnosis.id,
          role: "ASSISTANT",
          content: text
        }
      });
    }
  });

  return result.toAIStreamResponse();
}