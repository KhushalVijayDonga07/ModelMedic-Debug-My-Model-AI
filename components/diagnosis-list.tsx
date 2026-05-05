"use client";

import { useEffect, useState } from "react";
import { Diagnosis } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DiagnosisList() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/diagnoses");
      if (!response.ok) {
        setStatus("Unable to load diagnoses.");
        return;
      }
      const payload = await response.json();
      setDiagnoses(payload.diagnoses ?? []);
      setStatus(payload.diagnoses?.length ? "" : "No diagnoses yet.");
    };

    load();
  }, []);

  if (!diagnoses.length) {
    return <p className="text-sm text-slate-400">{status}</p>;
  }

  return (
    <div className="grid gap-4">
      {diagnoses.map((diagnosis) => (
        <Card key={diagnosis.id}> 
          <div className="flex flex-wrap items-center justify-between gap-4"> 
            <div>
              <h3 className="text-lg font-semibold text-slate-100"> 
                {diagnosis.title}
              </h3>
              <p className="text-xs text-slate-400"> 
                {new Date(diagnosis.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant="accent">{diagnosis.severity}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}