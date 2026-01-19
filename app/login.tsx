import { Text, View } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          Alert.alert("Erreur d'inscription", error.message);
        } else {
          // Vérifier si la confirmation par email est requise
          if (data.user && !data.user.confirmed_at) {
            setAwaitingVerification(true);
          } else {
            Alert.alert(
              "Inscription réussie",
              "Votre compte a été créé avec succès !",
              [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
            );
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          Alert.alert("Erreur de connexion", error.message);
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        Alert.alert("Erreur", error.message);
      } else {
        Alert.alert(
          "Email envoyé",
          "Un nouvel email de vérification a été envoyé",
        );
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  // Écran de vérification d'email
  if (awaitingVerification) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primary.dark}
        />

        <View style={styles.content}>
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationIcon}>📧</Text>
            <Text style={styles.verificationTitle}>Vérifiez votre email</Text>
            <Text style={styles.verificationText}>
              Nous avons envoyé un email de confirmation à{"\n"}
              <Text style={styles.verificationEmail}>{email}</Text>
            </Text>
            <Text style={styles.verificationInstructions}>
              Cliquez sur le lien dans l'email pour activer votre compte. Si
              vous ne voyez pas l'email, vérifiez vos spams.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={handleResendVerification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary.dark} />
              ) : (
                <Text style={styles.buttonText}>Renvoyer l'email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => {
                setAwaitingVerification(false);
                setIsSignUp(false);
              }}
            >
              <Text style={styles.buttonSecondaryText}>
                Retour à la connexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>💪</Text>
            <Text style={styles.title}>SmartGym</Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? "Créez un compte pour synchroniser vos données"
                : "Connectez-vous pour suivre vos performances"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.text.secondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={Colors.text.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary.dark} />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? "S'inscrire" : "Se connecter"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Sign Up / Sign In */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? "Déjà un compte ? Se connecter"
                  : "Pas de compte ? S'inscrire"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Text */}
          <Text style={styles.bottomText}>
            Synchronisez vos données sur tous vos appareils et suivez vos
            progrès
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  flex: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: Spacing.lg,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
    paddingBottom: Spacing.xxl,
  },
  header: {
    backgroundColor: Colors.primary.dark,
    alignItems: "center",
    marginBottom: Spacing.xxl * 2,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  content: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  verificationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  verificationIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  verificationTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  verificationText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  verificationEmail: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
  verificationInstructions: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  buttonSecondary: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonSecondaryText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  form: {
    backgroundColor: Colors.primary.dark,
    gap: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.primary.dark,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  toggleText: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  bottomText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.xxl,
  },
});
