import { supabase } from "@/utils/supabase";

/**
 * Récupère l'utilisateur_id à partir de l'auth_uuid
 * Crée automatiquement l'utilisateur s'il n'existe pas
 */
export async function getUserIdFromAuth(
  authUuid: string,
): Promise<number | null> {
  // Essayer de récupérer l'utilisateur existant
  const { data, error } = await supabase
    .from("utilisateurs")
    .select("utilisateur_id")
    .eq("auth_uuid", authUuid)
    .maybeSingle();

  // Si l'utilisateur existe, retourner son ID
  if (data?.utilisateur_id) {
    return data.utilisateur_id;
  }

  // Si l'utilisateur n'existe pas, le créer
  if (error?.code === "PGRST116" || !data) {
    console.log("Création d'un nouvel utilisateur dans la base...");

    // Récupérer l'email depuis auth
    const { data: authData } = await supabase.auth.getUser();
    const email = authData.user?.email || `user_${authUuid.slice(0, 8)}`;

    // Insérer le nouvel utilisateur
    const { data: newUser, error: insertError } = await supabase
      .from("utilisateurs")
      .insert({
        auth_uuid: authUuid,
        pseudo: email,
        niveau_general: "debutant",
        date_inscription: new Date().toISOString(),
      })
      .select("utilisateur_id")
      .single();

    if (insertError) {
      console.error(
        "Erreur lors de la création de l'utilisateur:",
        insertError,
      );
      return null;
    }

    console.log("Utilisateur créé avec succès:", newUser.utilisateur_id);

    // Créer les objectifs par défaut
    await creerObjectifsParDefaut(newUser.utilisateur_id);

    return newUser.utilisateur_id;
  }

  console.error("Erreur lors de la récupération de l'utilisateur_id:", error);
  return null;
}

/**
 * Crée les objectifs par défaut pour un nouvel utilisateur
 */
async function creerObjectifsParDefaut(utilisateurId: number) {
  const objectifsParDefaut = [
    {
      utilisateur_id: utilisateurId,
      type_objectif: "force",
      description: "Développer la force musculaire",
      est_actif: true,
    },
    {
      utilisateur_id: utilisateurId,
      type_objectif: "endurance",
      description: "Améliorer l'endurance cardiovasculaire",
      est_actif: true,
    },
    {
      utilisateur_id: utilisateurId,
      type_objectif: "poids",
      description: "Maintenir un poids santé",
      est_actif: true,
    },
  ];

  const { error } = await supabase
    .from("objectifs_utilisateurs")
    .insert(objectifsParDefaut);

  if (error) {
    console.error(
      "Erreur lors de la création des objectifs par défaut:",
      error,
    );
  } else {
    console.log("Objectifs par défaut créés avec succès");
  }
}

/**
 * Enregistre une performance après une séance
 */
export async function enregistrerPerformance(params: {
  utilisateurId: number;
  exerciceId: number;
  series: number;
  repetitions: number;
  charge?: number;
}) {
  const { data, error } = await supabase
    .from("performances")
    .insert({
      utilisateur_id: params.utilisateurId,
      exercice_id: params.exerciceId,
      series_effectuees: params.series,
      repetitions_effectuees: params.repetitions,
      charge_utilisee: params.charge || null,
      date_scan: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur lors de l'enregistrement de la performance:", error);
    throw error;
  }

  return data;
}

/**
 * Récupère les statistiques de l'utilisateur
 */
export async function getStatistiquesUtilisateur(utilisateurId: number) {
  // Nombre total de séances
  const { count: totalSeances } = await supabase
    .from("performances")
    .select("*", { count: "exact", head: true })
    .eq("utilisateur_id", utilisateurId);

  // Exercices différents effectués
  const { data: exercicesUniques } = await supabase
    .from("performances")
    .select("exercice_id")
    .eq("utilisateur_id", utilisateurId);

  const nombreExercicesUniques = new Set(
    exercicesUniques?.map((p) => p.exercice_id),
  ).size;

  // Dernière séance
  const { data: derniereSeance } = await supabase
    .from("performances")
    .select("date_scan")
    .eq("utilisateur_id", utilisateurId)
    .order("date_scan", { ascending: false })
    .limit(1)
    .single();

  return {
    totalSeances: totalSeances || 0,
    nombreExercicesUniques,
    derniereSeance: derniereSeance?.date_scan || null,
  };
}
