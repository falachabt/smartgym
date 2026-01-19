import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("exercices")
        .select("categorie_filtre");

      if (fetchError) {
        setError(fetchError.message);
        setCategories(["All"]);
      } else {
        // Extraire les catégories uniques (non nulles)
        const uniqueCategories = Array.from(
          new Set(
            data
              .map((item) => item.categorie_filtre)
              .filter((cat): cat is string => cat !== null && cat !== "")
          )
        ).sort();

        setCategories(["All", ...uniqueCategories]);
      }

      setLoading(false);
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
