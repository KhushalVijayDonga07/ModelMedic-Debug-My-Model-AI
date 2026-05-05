"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const frameworks = ["PYTORCH", "KERAS", "TENSORFLOW", "SKLEARN", "OTHER"]; 

export function DiagnosisForm() {
  const [status, setStatus] = useState<string>(" ");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    setStatus("Submitting diagnosis...");
    const response = await fetch("/api/diagnoses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setStatus("Failed to save diagnosis.");
      return;
    }

    setStatus("Diagnosis saved. You can review it in your dashboard.");
    event.currentTarget.reset();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Diagnosis title</Label>
        <Input id="title" name="title" placeholder="Vision transformer exploding gradients" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="framework">Framework</Label>
        <select
          id="framework"
          name="framework"
          required
          className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
        >
          {frameworks.map((framework) => (
            <option key={framework} value={framework}>
              {framework}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="modelArchitecture">Model architecture</Label>
        <Textarea
          id="modelArchitecture"
          name="modelArchitecture"
          rows={6}
          placeholder="Describe the model layers, optimizer, data pipeline, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="trainingLogs">Training logs</Label>
        <Textarea
          id="trainingLogs"
          name="trainingLogs"
          rows={8}
          placeholder="Paste training logs, errors, and metrics."
          required
        />
      </div>
      <Button type="submit">Save Diagnosis</Button>
      {status ? <p className="text-sm text-slate-300">{status}</p> : null}
    </form>
  );
}
