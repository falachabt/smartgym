import { Text, View } from "@/components/Themed";
import {
    BorderRadius,
    Colors,
    Shadows,
    Spacing,
    Typography,
} from "@/constants/Styles";

import { useCategories } from "@/hooks/useCategories";
import { useMachines } from "@/hooks/useMachine";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 3) / 2;

export default function TabOneScreen() {
  const { machines, loading, error } = useMachines();
  const { categories } = useCategories();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filtrage des machines
  const filteredMachines = useMemo(() => {
    let filtered = machines;

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter((machine) =>
        machine.nom_machine?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par catégorie - on regarde dans les exercices de chaque machine
    if (selectedCategory !== "All") {
      filtered = filtered.filter((machine) => {
        if (!machine.exercices || machine.exercices.length === 0) return false;

        return machine.exercices.some(
          (exercice) =>
            exercice.categorie_filtre?.toLowerCase() ===
            selectedCategory.toLowerCase()
        );
      });
    }

    return filtered;
  }, [machines, searchQuery, selectedCategory]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Machine Catalog</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a machine..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Machines Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.machinesGrid}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>Erreur: {error}</Text>
          </View>
        )}

        {!loading && filteredMachines.length === 0 && (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Aucune machine trouvée</Text>
          </View>
        )}

        {!loading &&
          filteredMachines.map((machine) => (
            <TouchableOpacity
              key={machine.qr_code_id}
              style={styles.machineCard}
              onPress={() => router.push(`/machine/${machine.qr_code_id}`)}
            >
              <Image
                source={{
                  uri:
                    machine.image_url ||
                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
                }}
                style={styles.machineImage}
                resizeMode="cover"
              />
              <View style={styles.machineInfo}>
                <Text style={styles.machineName} numberOfLines={2}>
                  {machine.nom_machine || "Machine sans nom"}
                </Text>
                <Text style={styles.machineCategory}>
                  {machine.exercices?.[0]?.categorie_filtre || "General"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  searchInput: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  categoriesContainer: {
    maxHeight: 60,
    backgroundColor: Colors.primary.dark,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  categoryChip: {
    backgroundColor: Colors.background.input,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryChipActive: {
    backgroundColor: Colors.primary.main,
  },
  categoryText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: Colors.primary.dark,
    fontWeight: Typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  machinesGrid: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  machineCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    ...Shadows.md,
  },
  machineImage: {
    width: "100%",
    height: CARD_WIDTH,
    backgroundColor: Colors.background.input,
  },
  machineInfo: {
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
  },
  machineName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  machineCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  centerContent: {
    flex: 1,
    width: SCREEN_WIDTH - Spacing.lg * 2,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.md,
  },
  errorText: {
    color: Colors.accent.red,
    fontSize: Typography.fontSize.md,
    textAlign: "center",
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    textAlign: "center",
  },
});
