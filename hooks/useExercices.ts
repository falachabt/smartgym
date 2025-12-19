import { Tables } from "@/types/supabase";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

type Exercice = Tables<"exercices">;

export function useExercices(machineId: number | null) {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!machineId) {
      setLoading(false);
      setExercices([]);
      return;
    }

    async function fetchExercices() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("exercices")
        .select("*")
        .eq("machine_id", machineId as number);

      if (fetchError) {
        setError(fetchError.message);
        setExercices([]);
      } else {
        setExercices(data || []);
      }

      setLoading(false);
    }

    fetchExercices();
  }, [machineId]);

  return { exercices, loading, error };
}
