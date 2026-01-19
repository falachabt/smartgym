import { Text, View } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Découvrez vos machines",
    description:
      "Scannez le QR code sur n'importe quelle machine pour accéder instantanément aux instructions détaillées",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
  },
  {
    id: 2,
    title: "Exercices personnalisés",
    description:
      "Découvrez les meilleurs exercices pour chaque groupe musculaire avec des vidéos et des explications",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
  },
  {
    id: 3,
    title: "Suivez vos performances",
    description:
      "Connectez-vous pour synchroniser et suivre vos progrès à travers toutes vos séances d'entraînement",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(tabs)");
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/login");
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />

      {/* Skip Button */}
      {!isLastStep && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: step.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentStep && styles.dotActive]}
            />
          ))}
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {isLastStep ? (
            <>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleFinish}
              >
                <Text style={styles.buttonPrimaryText}>Se connecter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={handleSkip}
              >
                <Text style={styles.buttonSecondaryText}>
                  Continuer sans compte
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleNext}>
              <Text style={styles.buttonPrimaryText}>Suivant</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
    paddingBottom: 20,
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: "white",
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    borderRadius: BorderRadius.md,
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
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: Colors.background.card,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background.input,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary.main,
    width: 24,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  buttonsContainer: {
    marginTop: "auto",
    gap: Spacing.md,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: Colors.primary.dark,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.background.input,
  },
  buttonSecondaryText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});
