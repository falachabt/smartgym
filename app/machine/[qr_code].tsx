import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { useExercices } from "@/hooks/useExercices";
import { useMachine } from "@/hooks/useMachine";
import { enregistrerPerformance, getUserIdFromAuth } from "@/utils/database";
import { supabase } from "@/utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Dummy data for machines
const MACHINES_DATA: Record<string, any> = {
  "leg-press": {
    id: "leg-press",
    name: "",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",

    tabs: [""],
    howToUse:
      "Sit on the machine with your back and head resting comfortably against the padded support. Place your feet on the footplate about hip-width apart, ensuring your heels are flat. Push the platform away using your heels and forefoot.",
    commonErrors: [
      "Not keeping back flat against the pad",
      "Locking knees at full extension",
      "Positioning feet too high or too low",
      "Using momentum instead of control",
    ],
    bodyPositioning: [
      "Back flat against pad",
      "Feet hip-width apart",
      "Knees aligned with toes",
      "Core engaged throughout",
    ],
    targetedMuscles: {
      primary: ["Quadriceps", "Glutes", "Hamstrings"],
      secondary: ["Calves", "Core"],
    },
    muscleImage:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
    recommendedWeights: {
      beginner: { weight: 40, reps: "12-15" },
      intermediate: { weight: 80, reps: "10-12" },
      advanced: { weight: 120, reps: "8-10" },
    },
    nutritionPlans: {
      beginner: {
        title: "Beginner Leg Press Nutrition Plan",
        description:
          "Focus on building foundational strength with balanced nutrition to support muscle recovery and energy levels.",
        calories: "2,200-2,500",
        macros: {
          protein: "150-180g (25-30%)",
          carbs: "250-300g (45-50%)",
          fats: "70-90g (25-30%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Oatmeal with banana and peanut butter",
              "Greek yogurt with berries",
              "Whole grain toast with avocado",
            ],
            calories: "~500",
          },
          {
            time: "Pre-workout Snack",
            items: ["Apple with almond butter", "Protein shake"],
            calories: "~250",
          },
          {
            time: "Post-workout Meal",
            items: [
              "Grilled chicken breast",
              "Brown rice",
              "Broccoli and sweet potato",
            ],
            calories: "~600",
          },
          {
            time: "Lunch",
            items: [
              "Turkey sandwich on whole grain bread",
              "Mixed greens salad",
              "Fruit salad",
            ],
            calories: "~500",
          },
          {
            time: "Dinner",
            items: ["Baked salmon", "Quinoa", "Steamed vegetables"],
            calories: "~550",
          },
        ],
        tips: [
          "Stay hydrated - aim for 3-4 liters of water daily",
          "Include protein in every meal to support muscle repair",
          "Focus on complex carbs for sustained energy",
          "Consider a post-workout protein shake within 30 minutes",
        ],
      },
      intermediate: {
        title: "Intermediate Leg Press Nutrition Plan",
        description:
          "Optimize performance with higher protein intake and strategic nutrient timing for muscle growth and recovery.",
        calories: "2,500-2,800",
        macros: {
          protein: "180-220g (28-32%)",
          carbs: "280-320g (42-45%)",
          fats: "80-100g (25-28%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Egg white omelet with spinach and whole grain toast",
              "Protein smoothie with banana and spinach",
            ],
            calories: "~550",
          },
          {
            time: "Mid-morning Snack",
            items: ["Cottage cheese with pineapple", "Handful of mixed nuts"],
            calories: "~300",
          },
          {
            time: "Pre-workout Meal",
            items: ["Chicken breast with sweet potato", "Green vegetables"],
            calories: "~500",
          },
          {
            time: "Post-workout Shake",
            items: ["Whey protein with creatine", "Banana and almond milk"],
            calories: "~350",
          },
          {
            time: "Lunch",
            items: [
              "Tuna salad with mixed greens",
              "Whole grain wrap",
              "Greek yogurt",
            ],
            calories: "~550",
          },
          {
            time: "Afternoon Snack",
            items: ["Protein bar", "Apple with cheese"],
            calories: "~250",
          },
          {
            time: "Dinner",
            items: ["Lean beef stir-fry", "Brown rice", "Broccoli and carrots"],
            calories: "~600",
          },
        ],
        tips: [
          "Increase protein intake to support muscle hypertrophy",
          "Time carbs around workouts for optimal performance",
          "Include healthy fats for hormone production",
          "Track your intake to ensure progressive results",
        ],
      },
      advanced: {
        title: "Advanced Leg Press Nutrition Plan",
        description:
          "Maximize strength gains with precise macronutrient ratios and advanced nutrient timing strategies.",
        calories: "2,800-3,200",
        macros: {
          protein: "220-260g (30-32%)",
          carbs: "320-380g (40-45%)",
          fats: "90-110g (25-28%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "6 egg whites with oatmeal and fruit",
              "Protein pancakes with Greek yogurt",
            ],
            calories: "~600",
          },
          {
            time: "Mid-morning Snack",
            items: [
              "Protein shake with creatine",
              "Rice cakes with peanut butter",
            ],
            calories: "~350",
          },
          {
            time: "Pre-workout Meal",
            items: [
              "Complex carb meal: Sweet potato, chicken, and rice",
              "Pre-workout supplement",
            ],
            calories: "~600",
          },
          {
            time: "Intra-workout",
            items: ["BCAA drink", "Electrolyte supplement"],
            calories: "~100",
          },
          {
            time: "Post-workout Shake",
            items: ["40g whey protein + 5g creatine + fast carbs"],
            calories: "~400",
          },
          {
            time: "Lunch",
            items: ["Large chicken breast", "Quinoa and vegetables", "Avocado"],
            calories: "~650",
          },
          {
            time: "Afternoon Snack",
            items: ["Greek yogurt with nuts and fruit", "Protein bar"],
            calories: "~350",
          },
          {
            time: "Dinner",
            items: [
              "Grilled steak or fish",
              "Complex carbs",
              "Mixed vegetables",
            ],
            calories: "~700",
          },
        ],
        tips: [
          "Precise tracking of macros is crucial",
          "Use intra-workout nutrition for longer sessions",
          "Consider carb cycling for optimal body composition",
          "Supplement strategically with creatine and BCAAs",
        ],
      },
    },
  },
  "lat-pulldown": {
    id: "lat-pulldown",
    name: "Lat Pulldown Machine",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",

    tabs: ["Back", "Lats", "Biceps"],
    howToUse:
      "Sit at the machine and secure your thighs under the pads. Grab the bar with a wide grip, palms facing forward. Pull the bar down to your upper chest while keeping your torso upright. Slowly return to the starting position.",
    commonErrors: [
      "Pulling bar behind neck",
      "Using too much momentum",
      "Leaning too far back",
      "Not engaging shoulder blades",
    ],
    bodyPositioning: [
      "Chest up and proud",
      "Slight arch in lower back",
      "Feet flat on floor",
      "Shoulders down and back",
    ],
    targetedMuscles: {
      primary: ["Latissimus Dorsi", "Rhomboids"],
      secondary: ["Biceps", "Rear Deltoids", "Trapezius"],
    },

    recommendedWeights: {
      beginner: { weight: 30, reps: "12-15" },
      intermediate: { weight: 50, reps: "10-12" },
      advanced: { weight: 70, reps: "8-10" },
    },
    nutritionPlans: {
      beginner: {
        title: "Beginner Lat Pulldown Nutrition Plan",
        description:
          "Build upper body strength with balanced nutrition focusing on back and biceps development.",
        calories: "2,200-2,500",
        macros: {
          protein: "150-180g (25-30%)",
          carbs: "250-300g (45-50%)",
          fats: "70-90g (25-30%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Whole grain toast with eggs and avocado",
              "Greek yogurt with honey",
              "Banana",
            ],
            calories: "~500",
          },
          {
            time: "Pre-workout Snack",
            items: ["Protein bar", "Handful of almonds"],
            calories: "~250",
          },
          {
            time: "Post-workout Meal",
            items: ["Turkey breast", "Sweet potato", "Mixed vegetables"],
            calories: "~600",
          },
          {
            time: "Lunch",
            items: ["Grilled chicken salad", "Brown rice", "Fruit"],
            calories: "~500",
          },
          {
            time: "Dinner",
            items: ["Baked cod", "Quinoa", "Broccoli and carrots"],
            calories: "~550",
          },
        ],
        tips: [
          "Focus on anti-inflammatory foods for joint health",
          "Include healthy fats like avocados and nuts",
          "Stay hydrated to support muscle function",
          "Consider BCAAs for muscle recovery",
        ],
      },
      intermediate: {
        title: "Intermediate Lat Pulldown Nutrition Plan",
        description:
          "Enhance back development with optimized protein timing and nutrient-dense meals.",
        calories: "2,500-2,800",
        macros: {
          protein: "180-220g (28-32%)",
          carbs: "280-320g (42-45%)",
          fats: "80-100g (25-28%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Oatmeal with protein powder and berries",
              "Egg whites with spinach",
            ],
            calories: "~550",
          },
          {
            time: "Mid-morning Snack",
            items: ["Cottage cheese", "Apple with peanut butter"],
            calories: "~300",
          },
          {
            time: "Pre-workout Meal",
            items: [
              "Chicken with rice and vegetables",
              "Pre-workout supplement",
            ],
            calories: "~500",
          },
          {
            time: "Post-workout Shake",
            items: ["Whey protein with banana", "Creatine supplement"],
            calories: "~350",
          },
          {
            time: "Lunch",
            items: [
              "Tuna wrap with whole grains",
              "Mixed greens",
              "Greek yogurt",
            ],
            calories: "~550",
          },
          {
            time: "Afternoon Snack",
            items: ["Protein shake", "Mixed nuts"],
            calories: "~250",
          },
          {
            time: "Dinner",
            items: ["Salmon with quinoa", "Asparagus and sweet potato"],
            calories: "~600",
          },
        ],
        tips: [
          "Prioritize omega-3 rich foods for joint health",
          "Time protein intake around workouts",
          "Include complex carbs for sustained energy",
          "Monitor recovery and adjust calories as needed",
        ],
      },
      advanced: {
        title: "Advanced Lat Pulldown Nutrition Plan",
        description:
          "Maximize back hypertrophy with precise macronutrient ratios and advanced supplementation.",
        calories: "2,800-3,200",
        macros: {
          protein: "220-260g (30-32%)",
          carbs: "320-380g (40-45%)",
          fats: "90-110g (25-28%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Protein pancakes with egg whites",
              "Oatmeal with creatine",
            ],
            calories: "~600",
          },
          {
            time: "Mid-morning Snack",
            items: ["Greek yogurt with nuts", "Protein shake"],
            calories: "~350",
          },
          {
            time: "Pre-workout Meal",
            items: ["Complex carbs with lean protein", "Pre-workout and BCAAs"],
            calories: "~600",
          },
          {
            time: "Intra-workout",
            items: ["BCAA drink", "Electrolyte supplement"],
            calories: "~100",
          },
          {
            time: "Post-workout Shake",
            items: ["40g whey + 5g creatine + fast carbs"],
            calories: "~400",
          },
          {
            time: "Lunch",
            items: ["Large chicken breast", "Brown rice and vegetables"],
            calories: "~650",
          },
          {
            time: "Afternoon Snack",
            items: ["Casein protein shake", "Avocado and nuts"],
            calories: "~350",
          },
          {
            time: "Dinner",
            items: ["Grilled steak", "Sweet potato and broccoli"],
            calories: "~700",
          },
        ],
        tips: [
          "Use intra-workout nutrition for intense sessions",
          "Consider joint supplements like glucosamine",
          "Track body composition changes",
          "Periodize nutrition around training cycles",
        ],
      },
    },
  },
  "chest-press": {
    id: "chest-press",
    name: "Chest Press Machine",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",

    tabs: ["Chest", "Pectorals", "Triceps"],
    howToUse:
      "Sit with your back flat against the pad. Grip the handles at chest height. Push the handles forward until your arms are extended, then slowly return to starting position.",
    commonErrors: [
      "Arching back excessively",
      "Flaring elbows too wide",
      "Not maintaining control on return",
      "Holding breath during movement",
    ],
    bodyPositioning: [
      "Back against pad",
      "Feet flat on floor",
      "Wrists straight",
      "Core engaged",
    ],
    targetedMuscles: {
      primary: ["Pectoralis Major", "Anterior Deltoids"],
      secondary: ["Triceps", "Serratus Anterior"],
    },

    recommendedWeights: {
      beginner: { weight: 25, reps: "12-15" },
      intermediate: { weight: 45, reps: "10-12" },
      advanced: { weight: 65, reps: "8-10" },
    },
    nutritionPlans: {
      beginner: {
        title: "Beginner Chest Press Nutrition Plan",
        description:
          "Build chest strength with balanced nutrition focusing on pectoral and tricep development.",
        calories: "2,200-2,500",
        macros: {
          protein: "150-180g (25-30%)",
          carbs: "250-300g (45-50%)",
          fats: "70-90g (25-30%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Whole grain toast with eggs and avocado",
              "Greek yogurt with berries",
              "Banana",
            ],
            calories: "~500",
          },
          {
            time: "Pre-workout Snack",
            items: ["Protein bar", "Handful of almonds"],
            calories: "~250",
          },
          {
            time: "Post-workout Meal",
            items: ["Grilled chicken breast", "Brown rice", "Mixed vegetables"],
            calories: "~600",
          },
          {
            time: "Lunch",
            items: [
              "Turkey sandwich on whole grain bread",
              "Mixed greens salad",
              "Fruit salad",
            ],
            calories: "~500",
          },
          {
            time: "Dinner",
            items: ["Baked salmon", "Quinoa", "Broccoli and carrots"],
            calories: "~550",
          },
        ],
        tips: [
          "Focus on anti-inflammatory foods for joint health",
          "Include healthy fats like avocados and nuts",
          "Stay hydrated to support muscle function",
          "Consider BCAAs for muscle recovery",
        ],
      },
      intermediate: {
        title: "Intermediate Chest Press Nutrition Plan",
        description:
          "Enhance chest development with optimized protein timing and nutrient-dense meals.",
        calories: "2,500-2,800",
        macros: {
          protein: "180-220g (28-32%)",
          carbs: "280-320g (42-45%)",
          fats: "80-100g (25-28%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Oatmeal with protein powder and berries",
              "Egg whites with spinach",
            ],
            calories: "~550",
          },
          {
            time: "Mid-morning Snack",
            items: ["Cottage cheese", "Apple with peanut butter"],
            calories: "~300",
          },
          {
            time: "Pre-workout Meal",
            items: [
              "Chicken with rice and vegetables",
              "Pre-workout supplement",
            ],
            calories: "~500",
          },
          {
            time: "Post-workout Shake",
            items: ["Whey protein with banana", "Creatine supplement"],
            calories: "~350",
          },
          {
            time: "Lunch",
            items: [
              "Tuna salad with mixed greens",
              "Whole grain wrap",
              "Greek yogurt",
            ],
            calories: "~550",
          },
          {
            time: "Afternoon Snack",
            items: ["Protein shake", "Mixed nuts"],
            calories: "~250",
          },
          {
            time: "Dinner",
            items: ["Salmon with quinoa", "Asparagus and sweet potato"],
            calories: "~600",
          },
        ],
        tips: [
          "Prioritize omega-3 rich foods for joint health",
          "Time protein intake around workouts",
          "Include complex carbs for sustained energy",
          "Monitor recovery and adjust calories as needed",
        ],
      },
      advanced: {
        title: "Advanced Chest Press Nutrition Plan",
        description:
          "Maximize chest hypertrophy with precise macronutrient ratios and advanced supplementation.",
        calories: "2,800-3,200",
        macros: {
          protein: "220-260g (30-32%)",
          carbs: "320-380g (40-45%)",
          fats: "90-110g (25-28%)",
        },
        meals: [
          {
            time: "Breakfast",
            items: [
              "Protein pancakes with egg whites",
              "Oatmeal with creatine",
            ],
            calories: "~600",
          },
          {
            time: "Mid-morning Snack",
            items: ["Greek yogurt with nuts", "Protein shake"],
            calories: "~350",
          },
          {
            time: "Pre-workout Meal",
            items: ["Complex carbs with lean protein", "Pre-workout and BCAAs"],
            calories: "~600",
          },
          {
            time: "Intra-workout",
            items: ["BCAA drink", "Electrolyte supplement"],
            calories: "~100",
          },
          {
            time: "Post-workout Shake",
            items: ["40g whey + 5g creatine + fast carbs"],
            calories: "~400",
          },
          {
            time: "Lunch",
            items: ["Large chicken breast", "Brown rice and vegetables"],
            calories: "~650",
          },
          {
            time: "Afternoon Snack",
            items: ["Casein protein shake", "Avocado and nuts"],
            calories: "~350",
          },
          {
            time: "Dinner",
            items: ["Grilled steak", "Sweet potato and broccoli"],
            calories: "~700",
          },
        ],
        tips: [
          "Use intra-workout nutrition for intense sessions",
          "Consider joint supplements like glucosamine",
          "Track body composition changes",
          "Periodize nutrition around training cycles",
        ],
      },
    },
  },
};

export default function MachineDetailsScreen() {
  const params = useLocalSearchParams();
  const machineId = (params.qr_code as string) || "leg-press";
  const machine = MACHINES_DATA[machineId] || MACHINES_DATA["leg-press"];

  const { machine: online, loading, error } = useMachine(machineId);
  const {
    exercices,
    loading: exercicesLoading,
    error: exercicesError,
  } = useExercices(online?.machine_id ?? null);

  const [selectedTab, setSelectedTab] = useState(machine.tabs[0]);
  const [selectedLevel, setSelectedLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    howToUse: false,
    commonErrors: false,
    bodyPositioning: false,
  });

  // Performance tracking states
  const [userId, setUserId] = useState<number | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [series, setSeries] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [charge, setCharge] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.id) {
        const id = await getUserIdFromAuth(user.id);
        setUserId(id);
      }
    });
  }, []);

  const handleSavePerformance = async () => {
    if (!userId) {
      Alert.alert(
        "Erreur",
        "Vous devez être connecté pour enregistrer une performance",
      );
      return;
    }

    if (!exercices || exercices.length === 0) {
      Alert.alert("Erreur", "Aucun exercice trouvé pour cette machine");
      return;
    }

    const seriesNum = parseInt(series);
    const repsNum = parseInt(repetitions);
    const chargeNum = charge ? parseFloat(charge) : undefined;

    if (!seriesNum || !repsNum || seriesNum <= 0 || repsNum <= 0) {
      Alert.alert(
        "Erreur",
        "Veuillez entrer des valeurs valides pour les séries et répétitions",
      );
      return;
    }

    setSaving(true);
    try {
      await enregistrerPerformance({
        utilisateurId: userId,
        exerciceId: exercices[0].exercice_id,
        series: seriesNum,
        repetitions: repsNum,
        charge: chargeNum,
      });

      Alert.alert(
        "Performance enregistrée !",
        `${seriesNum} séries × ${repsNum} répétitions${chargeNum ? ` avec ${chargeNum}kg` : ""} ont été enregistrées.`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowPerformanceModal(false);
              setSeries("");
              setRepetitions("");
              setCharge("");
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer la performance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{online?.nom_machine}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <Image
          source={{
            uri:
              online?.image_url ||
              "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
          }}
          style={styles.mainImage}
        />

        {/* Machine Name */}
        <View style={styles.titleSection}>
          <Text style={styles.machineName}>{machine.name}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {machine.tabs.map((tab: string) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Video Thumbnail */}
        <View style={styles.videoSection}>
          <Image
            source={{
              uri:
                exercices?.[0]?.video_url ||
                exercices?.[0]?.image_produit_url ||
                "",
            }}
            style={styles.videoThumbnail}
            resizeMode="contain"
          />
        </View>

        {/* Collapsible Sections */}
        <View style={styles.sectionsContainer}>
          {/* How to Use */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("howToUse")}
          >
            <Text style={styles.sectionTitle}>How to Use</Text>
            <Text style={styles.sectionArrow}>
              {expandedSections.howToUse ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
          {expandedSections.howToUse && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {online?.description_generale}
              </Text>
            </View>
          )}

          {/* Common Errors */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("commonErrors")}
          >
            <Text style={styles.sectionTitle}>Common Errors</Text>
            <Text style={styles.sectionArrow}>
              {expandedSections.commonErrors ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
          {expandedSections.commonErrors && (
            <View style={styles.sectionContent}>
              {machine.commonErrors.map((error: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          {/* Body Positioning */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("bodyPositioning")}
          >
            <Text style={styles.sectionTitle}>Body Positioning</Text>
            <Text style={styles.sectionArrow}>
              {expandedSections.bodyPositioning ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
          {expandedSections.bodyPositioning && (
            <View style={styles.sectionContent}>
              {machine.bodyPositioning.map(
                (position: string, index: number) => (
                  <Text key={index} style={styles.bulletPoint}>
                    • {position}
                  </Text>
                ),
              )}
            </View>
          )}
        </View>

        {/* Targeted Muscles */}
        <View style={styles.musclesSection}>
          <Text style={styles.musclesSectionTitle}></Text>
        </View>

        {/* Recommended Weights */}
        <View style={styles.weightsSection}>
          <Text style={styles.weightsSectionTitle}>Recommended Weights</Text>

          {/* Level Selector */}
          <View style={styles.levelSelector}>
            {(["beginner", "intermediate", "advanced"] as const).map(
              (level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    selectedLevel === level && styles.levelButtonActive,
                  ]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text
                    style={[
                      styles.levelButtonText,
                      selectedLevel === level && styles.levelButtonTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          {/* Weight Display */}
          <View style={styles.weightDisplay}>
            <View style={styles.weightBox}>
              <Text style={styles.weightLabel}>WEIGHT</Text>
              <Text style={styles.weightValue}>
                {machine.recommendedWeights[selectedLevel].weight}kg
              </Text>
            </View>
            <View style={styles.weightBox}>
              <Text style={styles.weightLabel}>Reps</Text>
              <Text style={styles.weightValue}>
                {machine.recommendedWeights[selectedLevel].reps}
              </Text>
            </View>
          </View>
        </View>

        {/* View Nutrition Plan Button */}
        <TouchableOpacity
          style={styles.nutritionButton}
          onPress={() => router.push(`/nutrition/${machineId}`)}
        >
          <Text style={styles.nutritionButtonText}>View Nutrition Plan</Text>
        </TouchableOpacity>

        {/* Save Performance Button */}
        <TouchableOpacity
          style={styles.savePerformanceButton}
          onPress={() => setShowPerformanceModal(true)}
        >
          <Text style={styles.savePerformanceButtonText}>
            ✓ Terminer l'exercice
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Performance Modal */}
      <Modal
        visible={showPerformanceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPerformanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enregistrer votre performance</Text>
            <Text style={styles.modalSubtitle}>
              {exercices?.[0]?.titre_exercice || online?.nom_machine}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de séries *</Text>
              <TextInput
                style={styles.input}
                value={series}
                onChangeText={setSeries}
                keyboardType="numeric"
                placeholder="Ex: 4"
                placeholderTextColor={Colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Répétitions par série *</Text>
              <TextInput
                style={styles.input}
                value={repetitions}
                onChangeText={setRepetitions}
                keyboardType="numeric"
                placeholder="Ex: 12"
                placeholderTextColor={Colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Charge (kg) - Optionnel</Text>
              <TextInput
                style={styles.input}
                value={charge}
                onChangeText={setCharge}
                keyboardType="decimal-pad"
                placeholder="Ex: 50"
                placeholderTextColor={Colors.text.secondary}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPerformanceModal(false)}
                disabled={saving}
              >
                <Text style={styles.modalCancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSavePerformance}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.primary.dark} />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
    paddingBottom: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: Colors.background.card,
  },
  titleSection: {
    padding: Spacing.md,
  },
  machineName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.input,
  },
  tabActive: {
    backgroundColor: Colors.primary.main,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary.dark,
    fontWeight: Typography.fontWeight.semibold,
  },
  videoSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.background.card,
    aspectRatio: 16 / 9,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  sectionsContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.input,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  sectionArrow: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  sectionContent: {
    paddingVertical: Spacing.md,
  },
  sectionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
  musclesSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  musclesSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  muscleImage: {
    width: "100%",
    height: 300,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.card,
  },
  weightsSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  weightsSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  levelSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  levelButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.input,
    alignItems: "center",
  },
  levelButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  levelButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  levelButtonTextActive: {
    color: Colors.primary.dark,
    fontWeight: Typography.fontWeight.semibold,
  },
  weightDisplay: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  weightBox: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  weightLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
  },
  weightValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  nutritionButton: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  nutritionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
  },
  savePerformanceButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.accent.green || "#4CAF50",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  savePerformanceButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.main,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  input: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.background.input,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalSaveButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
  },
});
