"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const [status, setStatus] = useState<string>("Idle");

  const createOrder = async () => {
    setStatus("Creating Razorpay order...");
    const response = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 199900, currency: "INR" })
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "Failed to create order");
      return;
    }
    setStatus(`Order created: ${payload.orderId}`);
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold">Billing</h1>
        <p className="text-sm text-slate-300">
          Manage your subscription and payment details.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm text-slate-300">Upgrade to Pro for unlimited diagnoses.</p>
        <Button className="mt-4" onClick={createOrder}>
          Create Razorpay Order
        </Button>
        <p className="mt-3 text-xs text-slate-400">{status}</p>
      </div>
    </section>
  );
}
