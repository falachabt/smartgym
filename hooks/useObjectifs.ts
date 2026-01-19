import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

type Objectif = {
  objectif_id: number;
  type_objectif: string;
  description: string;
  est_actif: boolean;
  date_creation: string;
  date_completion: string | null;
};

export function useObjectifs(userId: number | null) {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setObjectifs([]);
      return;
    }

    async function fetchObjectifs() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("objectifs_utilisateurs")
        .select("*")
        .eq("utilisateur_id", userId)
        .eq("est_actif", true)
        .order("date_creation", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setObjectifs([]);
      } else {
        setObjectifs(data || []);
      }

      setLoading(false);
    }

    fetchObjectifs();
  }, [userId]);

  const toggleObjectif = async (objectifId: number, estActif: boolean) => {
    const { error } = await supabase
      .from("objectifs_utilisateurs")
      .update({
        est_actif: !estActif,
        date_completion: !estActif ? null : new Date().toISOString(),
      })
      .eq("objectif_id", objectifId);

    if (!error && userId) {
      // Recharger les objectifs
      const { data } = await supabase
        .from("objectifs_utilisateurs")
        .select("*")
        .eq("utilisateur_id", userId)
        .eq("est_actif", true);

      setObjectifs(data || []);
    }
  };

  const ajouterObjectif = async (typeObjectif: string, description: string) => {
    if (!userId) return;

    const { error } = await supabase.from("objectifs_utilisateurs").insert({
      utilisateur_id: userId,
      type_objectif: typeObjectif,
      description: description,
      est_actif: true,
    });

    if (!error) {
      // Recharger les objectifs
      const { data } = await supabase
        .from("objectifs_utilisateurs")
        .select("*")
        .eq("utilisateur_id", userId)
        .eq("est_actif", true);

      setObjectifs(data || []);
    }

    return { error };
  };

  const modifierObjectif = async (objectifId: number, description: string) => {
    const { error } = await supabase
      .from("objectifs_utilisateurs")
      .update({ description })
      .eq("objectif_id", objectifId);

    if (!error && userId) {
      // Recharger les objectifs
      const { data } = await supabase
        .from("objectifs_utilisateurs")
        .select("*")
        .eq("utilisateur_id", userId)
        .eq("est_actif", true);

      setObjectifs(data || []);
    }

    return { error };
  };

  const supprimerObjectif = async (objectifId: number) => {
    const { error } = await supabase
      .from("objectifs_utilisateurs")
      .delete()
      .eq("objectif_id", objectifId);

    if (!error && userId) {
      // Recharger les objectifs
      const { data } = await supabase
        .from("objectifs_utilisateurs")
        .select("*")
        .eq("utilisateur_id", userId)
        .eq("est_actif", true);

      setObjectifs(data || []);
    }
  };

  return {
    objectifs,
    loading,
    error,
    toggleObjectif,
    ajouterObjectif,
    modifierObjectif,
    supprimerObjectif,
  };
}
