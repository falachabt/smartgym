import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Check for updates on mount
  useEffect(() => {
    // Skip updates check on web platform or in Expo Go
    if (Platform.OS === "web" || __DEV__) {
      return;
    }

    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        // Handle error - you can add logging here if needed
        console.error("Error fetching updates:", error);
      }
    }

    onFetchUpdateAsync();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    async function checkOnboarding() {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(seen === "true");
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (hasSeenOnboarding === null) return;

    const inOnboarding = segments[0] === "onboarding";
    const inLogin = segments[0] === "login";

    if (!hasSeenOnboarding && !inOnboarding && !inLogin) {
      router.replace("/onboarding");
    }
  }, [hasSeenOnboarding, segments]);

  if (hasSeenOnboarding === null) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="machine" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="notifications"
          options={{ presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
