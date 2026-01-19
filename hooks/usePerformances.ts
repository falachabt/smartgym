import { Tables } from "@/types/supabase";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

type Performance = Tables<"performances"> & {
  exercices?: {
    titre_exercice: string;
    categorie_filtre: string | null;
  };
};

export function usePerformances(userId: number | null) {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPerformances([]);
      return;
    }

    async function fetchPerformances() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("performances")
        .select(
          `
          *,
          exercices (
            titre_exercice,
            categorie_filtre
          )
        `,
        )
        .eq("utilisateur_id", userId)
        .order("date_scan", { ascending: false })
        .limit(10);

      if (fetchError) {
        setError(fetchError.message);
        setPerformances([]);
      } else {
        setPerformances(data || []);
      }

      setLoading(false);
    }

    fetchPerformances();
  }, [userId]);

  return { performances, loading, error };
}
