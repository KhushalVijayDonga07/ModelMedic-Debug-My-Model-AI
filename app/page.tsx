import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20">
      <div className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">ModelMedic</p>
        <h1 className="text-4xl font-semibold md:text-6xl">
          Diagnose training failures and ship stronger AI models faster.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Paste model architecture, training logs, and stack traces. ModelMedic
          triages issues, suggests fixes, and keeps your experiments organized.
        </p>
        <div className="flex flex-wrap gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg">Get Started</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </SignedIn>
          <Button asChild size="lg" variant="outline">
            <Link href="/diagnose">Run a Diagnosis</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Log-aware analysis",
            description: "Upload training logs and error traces for automatic issue extraction."
          },
          {
            title: "Actionable fixes",
            description: "Claude-powered suggestions tailored to your framework and model."
          },
          {
            title: "Team visibility",
            description: "Centralize every diagnosis and share updates with stakeholders."
          }
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-100">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
