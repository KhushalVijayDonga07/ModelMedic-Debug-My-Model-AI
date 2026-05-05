import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DiagnosisList } from "@/components/diagnosis-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Your Diagnoses</h1>
          <p className="text-sm text-slate-300">
            Track model issues, severity, and recommended fixes.
          </p>
        </div>
        <Button asChild>
          <Link href="/diagnose">New Diagnosis</Link>
        </Button>
      </div>
      <DiagnosisList />
    </section>
  );
}
