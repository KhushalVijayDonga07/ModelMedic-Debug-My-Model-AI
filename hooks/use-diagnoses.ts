import { useCallback, useState } from "react";
import { Diagnosis } from "@/types";

export function useDiagnoses() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiagnoses = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/diagnoses");
    const payload = await response.json();
    setDiagnoses(payload.diagnoses ?? []);
    setLoading(false);
  }, []);

  const createDiagnosis = useCallback(async (data: Record<string, unknown>) => {
    const response = await fetch("/api/diagnoses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.ok;
  }, []);

  return { diagnoses, loading, fetchDiagnoses, createDiagnosis };
}