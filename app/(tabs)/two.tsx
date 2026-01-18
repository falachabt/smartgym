import { Text, View } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { useCategories } from "@/hooks/useCategories";
import { useMachines } from "@/hooks/useMachine";
import { usePerformances } from "@/hooks/usePerformances";
import { supabase } from "@/utils/supabase";
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

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || "👤"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.email || "Visiteur"}</Text>
          {user && <Text style={styles.email}>{user.email}</Text>}
        </View>

        {/* Statistics Section */}
        {user && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>📊 Mes statistiques</Text>
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
            <Text style={styles.objectivesTitle}>🎯 Mes objectifs</Text>
            <View style={styles.objectivesList}>
              <View style={styles.objectiveItem}>
                <Text style={styles.objectiveIcon}>💪</Text>
                <Text style={styles.objectiveText}>
                  Développer la force musculaire
                </Text>
              </View>
              <View style={styles.objectiveItem}>
                <Text style={styles.objectiveIcon}>🏃</Text>
                <Text style={styles.objectiveText}>
                  Améliorer l'endurance cardiovasculaire
                </Text>
              </View>
              <View style={styles.objectiveItem}>
                <Text style={styles.objectiveIcon}>⚖️</Text>
                <Text style={styles.objectiveText}>
                  Maintenir un poids santé
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* History Section */}
        {user && showingHistory && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>📅 Historique récent</Text>
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
                <Text style={styles.menuItemText}>🎯 Mes objectifs</Text>
                <Text style={styles.menuItemArrow}>
                  {showingObjectives ? "⌄" : "›"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowingHistory(!showingHistory)}
              >
                <Text style={styles.menuItemText}>📅 Historique</Text>
                <Text style={styles.menuItemArrow}>
                  {showingHistory ? "⌄" : "›"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>⚙️ Paramètres</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={handleSignOut}
              >
                <Text style={styles.menuItemTextDanger}>🚪 Déconnexion</Text>
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

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>⚙️ Paramètres</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>❓ Aide</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
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
  },
  name: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
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
  menuItemText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  menuItemArrow: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.secondary,
  },
  menuItemDanger: {
    marginTop: Spacing.md,
  },
  menuItemTextDanger: {
    fontSize: Typography.fontSize.md,
    color: Colors.accent.red,
    fontWeight: Typography.fontWeight.medium,
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
  },
  loginPromptText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
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
  },
  statsSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  statsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
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
  },
  objectivesList: {
    gap: Spacing.sm,
  },
  objectiveItem: {
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  objectiveIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  objectiveText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    flex: 1,
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
  },
  historyList: {
    gap: Spacing.sm,
  },
  historyItem: {
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  historyContent: {
    gap: Spacing.xs,
  },
  historyExercise: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  historyDetails: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  historyDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },
  noHistoryText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
