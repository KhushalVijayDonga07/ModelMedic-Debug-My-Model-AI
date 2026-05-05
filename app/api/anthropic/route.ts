import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic } from "@/lib/anthropic";
import { z } from "zod";

const requestSchema = z.object({
  title: z.string().min(3),
  modelArchitecture: z.string().min(10),
  trainingLogs: z.string().min(10),
  framework: z.string()
});

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = requestSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const prompt = `You are ModelMedic. Diagnose the ML issue and respond in JSON with fields: issuesFound (array), fixSuggestions (array), severity (LOW/MEDIUM/HIGH/CRITICAL).
\nTitle: ${payload.data.title}\nFramework: ${payload.data.framework}\nArchitecture:\n${payload.data.modelArchitecture}\n\nTraining Logs:\n${payload.data.trainingLogs}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }]
  });

  const content = response.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("\n");

  return NextResponse.json({ result: content });
}