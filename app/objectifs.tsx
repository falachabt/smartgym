import { Text, View as ThemedView } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { useObjectifs } from "@/hooks/useObjectifs";
import { getUserIdFromAuth } from "@/utils/database";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ObjectifType = "force" | "endurance" | "poids" | "autre";

export default function ObjectifsScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [ajoutActif, setAjoutActif] = useState(false);
  const [nouveauType, setNouveauType] = useState<ObjectifType>("force");
  const [nouveauTexte, setNouveauTexte] = useState("");

  const { objectifs, ajouterObjectif, modifierObjectif, supprimerObjectif } =
    useObjectifs(userId);

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.id) {
        const id = await getUserIdFromAuth(user.id);
        setUserId(id);
      }
    });
  }, []);

  const getIconName = (type: string): any => {
    switch (type) {
      case "force":
        return "barbell";
      case "endurance":
        return "fitness";
      case "poids":
        return "scale";
      default:
        return "trophy";
    }
  };

  const handleStartEdit = (objectifId: number, description: string) => {
    setEditingId(objectifId);
    setEditingText(description);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim()) return;

    const { error } = await modifierObjectif(editingId, editingText);
    if (!error) {
      setEditingId(null);
      setEditingText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleAjouterObjectif = async () => {
    if (!nouveauTexte.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une description");
      return;
    }

    const { error } = await ajouterObjectif(nouveauType, nouveauTexte);
    if (!error) {
      setAjoutActif(false);
      setNouveauTexte("");
      setNouveauType("force");
    } else {
      Alert.alert("Erreur", "Impossible d'ajouter l'objectif");
    }
  };

  const handleDelete = (objectifId: number, description: string) => {
    Alert.alert(
      "Supprimer l'objectif",
      `Êtes-vous sûr de vouloir supprimer "${description}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => supprimerObjectif(objectifId),
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />

      {/* Header
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes objectifs</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Liste des objectifs */}
        <View style={styles.section}>
          {objectifs.map((objectif) => (
            <View key={objectif.objectif_id} style={styles.objectifCard}>
              {editingId === objectif.objectif_id ? (
                // Mode édition
                <View style={styles.editContainer}>
                  <Ionicons
                    name={getIconName(objectif.type_objectif)}
                    size={24}
                    color={Colors.primary.main}
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    value={editingText}
                    onChangeText={setEditingText}
                    placeholder="Description de l'objectif"
                    placeholderTextColor={Colors.text.secondary}
                    multiline
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      onPress={handleSaveEdit}
                      style={styles.saveButton}
                    >
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={Colors.primary.dark}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      style={styles.cancelButton}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={Colors.text.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Mode affichage
                <View style={styles.objectifContent}>
                  <Ionicons
                    name={getIconName(objectif.type_objectif)}
                    size={24}
                    color={Colors.primary.main}
                    style={styles.icon}
                  />
                  <Text style={styles.objectifText}>
                    {objectif.description}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() =>
                        handleStartEdit(
                          objectif.objectif_id,
                          objectif.description,
                        )
                      }
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="pencil"
                        size={20}
                        color={Colors.text.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleDelete(objectif.objectif_id, objectif.description)
                      }
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash"
                        size={20}
                        color={Colors.accent.red}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Formulaire d'ajout */}
          {ajoutActif ? (
            <View style={styles.ajoutCard}>
              <Text style={styles.ajoutTitle}>Nouvel objectif</Text>

              {/* Sélection du type */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    nouveauType === "force" && styles.typeButtonActive,
                  ]}
                  onPress={() => setNouveauType("force")}
                >
                  <Ionicons
                    name="barbell"
                    size={20}
                    color={
                      nouveauType === "force"
                        ? Colors.primary.dark
                        : Colors.text.primary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      nouveauType === "force" && styles.typeButtonTextActive,
                    ]}
                  >
                    Force
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    nouveauType === "endurance" && styles.typeButtonActive,
                  ]}
                  onPress={() => setNouveauType("endurance")}
                >
                  <Ionicons
                    name="fitness"
                    size={20}
                    color={
                      nouveauType === "endurance"
                        ? Colors.primary.dark
                        : Colors.text.primary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      nouveauType === "endurance" &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    Endurance
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    nouveauType === "poids" && styles.typeButtonActive,
                  ]}
                  onPress={() => setNouveauType("poids")}
                >
                  <Ionicons
                    name="scale"
                    size={20}
                    color={
                      nouveauType === "poids"
                        ? Colors.primary.dark
                        : Colors.text.primary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      nouveauType === "poids" && styles.typeButtonTextActive,
                    ]}
                  >
                    Poids
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    nouveauType === "autre" && styles.typeButtonActive,
                  ]}
                  onPress={() => setNouveauType("autre")}
                >
                  <Ionicons
                    name="trophy"
                    size={20}
                    color={
                      nouveauType === "autre"
                        ? Colors.primary.dark
                        : Colors.text.primary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      nouveauType === "autre" && styles.typeButtonTextActive,
                    ]}
                  >
                    Autre
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input description */}
              <TextInput
                style={styles.ajoutInput}
                value={nouveauTexte}
                onChangeText={setNouveauTexte}
                placeholder="Décrivez votre objectif..."
                placeholderTextColor={Colors.text.secondary}
                multiline
              />

              {/* Boutons */}
              <View style={styles.ajoutButtons}>
                <TouchableOpacity
                  onPress={handleAjouterObjectif}
                  style={styles.ajouterButton}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary.dark}
                  />
                  <Text style={styles.ajouterButtonText}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setAjoutActif(false);
                    setNouveauTexte("");
                    setNouveauType("force");
                  }}
                  style={styles.annulerButton}
                >
                  <Text style={styles.annulerButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAjoutActif(true)}
            >
              <Ionicons
                name="add-circle"
                size={24}
                color={Colors.primary.main}
              />
              <Text style={styles.addButtonText}>Ajouter un objectif</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.primary.dark,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  objectifCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  objectifContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.background.card,
  },
  icon: {
    backgroundColor: "transparent",
  },
  objectifText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    backgroundColor: Colors.background.card,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    backgroundColor: Colors.background.card,
  },
  actionButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.background.card,
  },
  editContainer: {
    gap: Spacing.md,
    backgroundColor: Colors.background.card,
  },
  input: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    minHeight: 60,
  },
  editButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
    backgroundColor: Colors.background.card,
  },
  saveButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.background.input,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: Colors.background.card,
  },
  ajoutCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  ajoutTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.background.card,
  },
  typeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
    backgroundColor: Colors.background.card,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.input,
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  typeButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: "transparent",
  },
  typeButtonTextActive: {
    color: Colors.primary.dark,
    fontWeight: Typography.fontWeight.bold,
    backgroundColor: "transparent",
  },
  ajoutInput: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    minHeight: 80,
  },
  ajoutButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    backgroundColor: Colors.background.card,
  },
  ajouterButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  ajouterButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
    backgroundColor: Colors.primary.main,
  },
  annulerButton: {
    flex: 1,
    backgroundColor: Colors.background.input,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  annulerButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    backgroundColor: Colors.background.input,
  },
});
