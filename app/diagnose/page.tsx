import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DiagnosisForm } from "@/components/diagnosis-form";

export default function DiagnosePage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold">New Diagnosis</h1>
        <p className="text-sm text-slate-300">
          Share architecture details and logs to get a tailored diagnosis.
        </p>
      </div>
      <DiagnosisForm />
    </section>
  );
}
