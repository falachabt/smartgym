import { StyleSheet, TouchableOpacity } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { useMachines } from "@/hooks/useMachine";
import { useRouter } from "expo-router";

export default function TabOneScreen() {
  // Déclaration des états pour les données et le chargement
  const { machines, loading, error } = useMachines();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue des Machines</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {/* Affichage conditionnel basé sur l'état de chargement */}
      {loading && <Text>Chargement des données...</Text>}

      {!loading && machines.length === 0 && (
        <Text>Aucune machine trouvée sur Supabase.</Text>
      )}

      {/* Affichage de la liste des machines */}
      {!loading &&
        machines.map((machine, index) => (
          <View key={index} style={styles.listItem}>
            <TouchableOpacity
              onPress={() => {
                router.push(`/machine/${machine.qr_code_id}`);
              }}
            >
              <Text style={styles.machineName}>
                {machine.nom_machine || "Machine sans nom"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

// --- Définition des Styles (Ajout de listItem et machineName) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40, // Ajout de padding pour le haut
  },
  title: {
    fontSize: 24, // Taille légèrement augmentée
    fontWeight: "bold",
    marginBottom: 10,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  // Nouveaux styles ajoutés pour la liste
  listItem: {
    padding: 10,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "90%",
    alignItems: "center",
  },
  machineName: {
    fontSize: 16,
    color: "#333", // Couleur de texte plus foncée
  },
});
