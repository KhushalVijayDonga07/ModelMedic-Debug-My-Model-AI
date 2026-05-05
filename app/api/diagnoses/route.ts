import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const diagnosisSchema = z.object({
  title: z.string().min(3),
  modelArchitecture: z.string().min(10),
  trainingLogs: z.string().min(10),
  framework: z.enum(["PYTORCH", "KERAS", "TENSORFLOW", "SKLEARN", "OTHER"])
});

async function ensureUser(clerkId: string, email: string | null, name: string | null) {
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      clerkId,
      email: email ?? "",
      name: name ?? "",
      plan: "FREE",
      diagnosesUsed: 0
    }
  });
}

export async function GET() {
  const { userId, sessionClaims } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUser(
    userId,
    (sessionClaims?.email as string) ?? null,
    (sessionClaims?.name as string) ?? null
  );

  const diagnoses = await prisma.diagnosis.findMany({
    where: { user: { clerkId: userId } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ diagnoses });
}

export async function POST(request: Request) {
  const { userId, sessionClaims } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = diagnosisSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const user = await ensureUser(
    userId,
    (sessionClaims?.email as string) ?? null,
    (sessionClaims?.name as string) ?? null
  );

  const diagnosis = await prisma.diagnosis.create({
    data: {
      userId: user.id,
      title: payload.data.title,
      modelArchitecture: payload.data.modelArchitecture,
      trainingLogs: payload.data.trainingLogs,
      framework: payload.data.framework,
      issuesFound: [],
      fixSuggestions: [],
      severity: "LOW"
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { diagnosesUsed: { increment: 1 } }
  });

  return NextResponse.json({ diagnosis }, { status: 201 });
}