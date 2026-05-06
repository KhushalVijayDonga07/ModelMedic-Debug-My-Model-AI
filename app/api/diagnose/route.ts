import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { runDiagnosisEngine } from "@/lib/diagnosis-engine";

const requestSchema = z.object({
  modelArchitecture: z.string().min(10),
  trainingLogs: z.string().min(10),
  framework: z.string().min(2)
});

const FREE_MONTHLY_LIMIT = 5;

type ErrorResponse = {
  error: string;
  details?: unknown;
  remainingUses?: number | null;
};

async function getOrCreateUser(
  clerkId: string,
  email: string | null,
  name: string | null
) {
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

function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function POST(request: Request) {
  const { userId, sessionClaims } = auth();
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

  try {
    const user = await getOrCreateUser(
      userId,
      (sessionClaims?.email as string) ?? null,
      (sessionClaims?.name as string) ?? null
    );

    const monthStart = getMonthStart();
    const monthlyCount = await prisma.diagnosis.count({
      where: {
        userId: user.id,
        createdAt: { gte: monthStart }
      }
    });

    if (user.plan === "FREE" && monthlyCount >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json<ErrorResponse>(
        { error: "Monthly free diagnosis limit reached.", remainingUses: 0 },
        { status: 429 }
      );
    }

    const diagnosis = await runDiagnosisEngine(payload.data);

    const record = await prisma.diagnosis.create({
      data: {
        userId: user.id,
        title: `Diagnosis ${new Date().toISOString().slice(0, 10)}`,
        modelArchitecture: payload.data.modelArchitecture,
        trainingLogs: payload.data.trainingLogs,
        framework: payload.data.framework as never,
        issuesFound: diagnosis.issues,
        fixSuggestions: diagnosis.fixes,
        severity: diagnosis.severity as never
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { diagnosesUsed: { increment: 1 } }
    });

    const remainingUses =
      user.plan === "FREE"
        ? Math.max(FREE_MONTHLY_LIMIT - (monthlyCount + 1), 0)
        : null;

    return NextResponse.json({
      diagnosis: { ...diagnosis, id: record.id },
      remainingUses
    });
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { error: "Diagnosis failed", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
