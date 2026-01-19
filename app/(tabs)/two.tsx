import { Text, View } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { useCategories } from "@/hooks/useCategories";
import { useMachines } from "@/hooks/useMachine";
import { useObjectifs } from "@/hooks/useObjectifs";
import { usePerformances } from "@/hooks/usePerformances";
import { getUserIdFromAuth } from "@/utils/database";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [showingObjectives, setShowingObjectives] = useState(false);
  const [showingHistory, setShowingHistory] = useState(false);
  const router = useRouter();
  const { machines } = useMachines();
  const { categories } = useCategories();
  const { performances } = usePerformances(userId);
  const { objectifs, supprimerObjectif } = useObjectifs(userId);

  const handleDeleteObjectif = (objectifId: number, description: string) => {
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

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);

      // Récupérer l'utilisateur_id depuis la table utilisateurs
      if (user?.id) {
        const id = await getUserIdFromAuth(user.id);
        setUserId(id);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      // Récupérer l'utilisateur_id
      if (session?.user?.id) {
        const id = await getUserIdFromAuth(session.user.id);
        setUserId(id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch total exercises count
    const fetchTotalExercises = async () => {
      const { count, error } = await supabase
        .from("exercices")
        .select("*", { count: "exact", head: true });

      if (!error && count !== null) {
        setTotalExercises(count);
      }
    };

    fetchTotalExercises();
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          setUser(null);
        },
      },
    ]);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primary.dark}
        />
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user ? (
              <Text style={styles.avatarText}>
                {user.email?.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={50} color={Colors.primary.dark} />
            )}
          </View>
          <Text style={styles.name}>{user?.email || "Visiteur"}</Text>
          {user && <Text style={styles.email}>{user.email}</Text>}
        </View>

        {/* Statistics Section */}
        {user && (
          <View style={styles.statsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="stats-chart"
                size={24}
                color={Colors.primary.main}
              />
              <Text style={styles.statsTitle}>Mes statistiques</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{machines.length}</Text>
                <Text style={styles.statLabel}>Machines</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{categories.length - 1}</Text>
                <Text style={styles.statLabel}>Catégories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalExercises}</Text>
                <Text style={styles.statLabel}>Exercices</Text>
              </View>
            </View>
          </View>
        )}

        {/* Objectives Section */}
        {user && showingObjectives && (
          <View style={styles.objectivesSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={24} color={Colors.primary.main} />
              <Text style={styles.objectivesTitle}>Mes objectifs</Text>
              <TouchableOpacity
                onPress={() => router.push("/objectifs" as any)}
                style={styles.editHeaderButton}
              >
                <Ionicons name="create" size={20} color={Colors.primary.main} />
              </TouchableOpacity>
            </View>
            <View style={styles.objectivesList}>
              {objectifs.length > 0 ? (
                objectifs.map((objectif) => (
                  <View key={objectif.objectif_id} style={styles.objectiveItem}>
                    <View style={styles.objectiveContent}>
                      <Ionicons
                        name={
                          objectif.type_objectif === "force"
                            ? "barbell"
                            : objectif.type_objectif === "endurance"
                              ? "fitness"
                              : "scale"
                        }
                        size={24}
                        color={Colors.primary.main}
                        style={styles.objectiveIcon}
                      />
                      <Text style={styles.objectiveText}>
                        {objectif.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteObjectif(
                          objectif.objectif_id,
                          objectif.description,
                        )
                      }
                      style={styles.deleteButton}
                    >
                      <Ionicons
                        name="trash"
                        size={20}
                        color={Colors.accent.red}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.objectiveItem}>
                  <Ionicons
                    name="barbell"
                    size={24}
                    color={Colors.primary.main}
                    style={styles.objectiveIcon}
                  />
                  <Text style={styles.objectiveText}>
                    Développer la force musculaire
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* History Section */}
        {user && showingHistory && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={24} color={Colors.primary.main} />
              <Text style={styles.historyTitle}>Historique récent</Text>
            </View>
            <View style={styles.historyList}>
              {performances.length > 0 ? (
                performances.map((performance) => (
                  <View
                    key={performance.performance_id}
                    style={styles.historyItem}
                  >
                    <View style={styles.historyContent}>
                      <Text style={styles.historyExercise}>
                        {performance.exercices?.titre_exercice ||
                          "Exercice inconnu"}
                      </Text>
                      <Text style={styles.historyDetails}>
                        {performance.series_effectuees || 0} séries ×{" "}
                        {performance.repetitions_effectuees || 0} répétitions
                        {performance.charge_utilisee &&
                          ` • ${performance.charge_utilisee}kg`}
                      </Text>
                      <Text style={styles.historyDate}>
                        {performance.date_scan
                          ? new Date(performance.date_scan).toLocaleDateString(
                              "fr-FR",
                            )
                          : "Date inconnue"}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noHistoryText}>
                  Aucun historique disponible
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {user ? (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowingObjectives(!showingObjectives)}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name="trophy"
                    size={20}
                    color={Colors.text.primary}
                  />
                  <Text style={styles.menuItemText}>Mes objectifs</Text>
                </View>
                <Ionicons
                  name={showingObjectives ? "chevron-down" : "chevron-forward"}
                  size={20}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowingHistory(!showingHistory)}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={Colors.text.primary}
                  />
                  <Text style={styles.menuItemText}>Historique</Text>
                </View>
                <Ionicons
                  name={showingHistory ? "chevron-down" : "chevron-forward"}
                  size={20}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/notifications" as any)}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={Colors.text.primary}
                  />
                  <Text style={styles.menuItemText}>Notifications</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={handleSignOut}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name="log-out"
                    size={20}
                    color={Colors.accent.red}
                  />
                  <Text style={styles.menuItemTextDanger}>Déconnexion</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptTitle}>
                  Synchronisez vos données
                </Text>
                <Text style={styles.loginPromptText}>
                  Connectez-vous pour suivre vos performances, enregistrer vos
                  séances et accéder à vos données sur tous vos appareils.
                </Text>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartGym v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  content: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    backgroundColor: Colors.primary.dark,

    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
    backgroundColor: Colors.primary.main,
  },
  name: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.primary.dark,
  },
  email: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    backgroundColor: Colors.primary.dark,
  },
  menuSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.primary.dark,
  },
  menuItem: {
    backgroundColor: Colors.background.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.background.card,
  },
  menuItemText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: Colors.background.card,
  },
  menuItemDanger: {
    marginTop: Spacing.md,
  },
  menuItemTextDanger: {
    fontSize: Typography.fontSize.md,
    color: Colors.accent.red,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: Colors.background.card,
  },
  loginPrompt: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  loginPromptTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.card,
  },
  loginPromptText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background.card,
  },
  loginButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  loginButtonText: {
    color: Colors.primary.dark,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    backgroundColor: Colors.primary.main,
  },
  footer: {
    backgroundColor: Colors.primary.dark,

    alignItems: "center",
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    backgroundColor: Colors.primary.dark,
  },
  statsSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  editHeaderButton: {
    marginLeft: "auto",
    padding: Spacing.xs,
    backgroundColor: Colors.primary.dark,
  },
  statsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.primary.dark,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.primary.dark,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  statNumber: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.primary.dark,
  },
  statLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    backgroundColor: Colors.primary.dark,
  },
  objectivesSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  objectivesTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  objectivesList: {
    gap: Spacing.sm,
    backgroundColor: Colors.primary.dark,
  },
  objectiveItem: {
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  objectiveContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: Colors.background.card,
  },
  objectiveIcon: {
    marginRight: Spacing.md,
    backgroundColor: "transparent",
  },
  objectiveText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    flex: 1,
    backgroundColor: Colors.background.card,
  },
  deleteButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.background.card,
  },
  historySection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  historyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  historyList: {
    gap: Spacing.sm,
    backgroundColor: Colors.primary.dark,
  },
  historyItem: {
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  historyContent: {
    gap: Spacing.xs,
    backgroundColor: Colors.background.card,
  },
  historyExercise: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    backgroundColor: Colors.background.card,
  },
  historyDetails: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    backgroundColor: Colors.background.card,
  },
  historyDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontStyle: "italic",
    backgroundColor: Colors.background.card,
  },
  noHistoryText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
    backgroundColor: Colors.primary.dark,
  },
});
