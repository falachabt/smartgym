import { Text, View } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
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
  const router = useRouter();

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

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {user ? (
            <>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>📊 Mes statistiques</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>🎯 Mes objectifs</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>📅 Historique</Text>
                <Text style={styles.menuItemArrow}>›</Text>
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
});
