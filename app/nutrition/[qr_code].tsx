import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Dummy data for machines (same as in machine detail screen)
const MACHINES_DATA: Record<string, any> = {
  "leg-press": {
    id: "leg-press",
    name: "Leg Press Machine",
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

export default function NutritionScreen() {
  const params = useLocalSearchParams();
  const machineId = (params.qr_code as string) || "leg-press";
  const machine = MACHINES_DATA[machineId] || MACHINES_DATA["leg-press"];

  const [selectedLevel, setSelectedLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    meals: false,
    tips: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const currentPlan = machine.nutritionPlans[selectedLevel];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{machine.name} Nutrition</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Title */}
        <View style={styles.titleSection}>
          <Text style={styles.planTitle}>{currentPlan.title}</Text>
          <Text style={styles.planDescription}>{currentPlan.description}</Text>
        </View>

        {/* Level Selector */}
        <View style={styles.levelSelector}>
          {(["beginner", "intermediate", "advanced"] as const).map((level) => (
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
          ))}
        </View>

        {/* Calories and Macros */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Daily Overview</Text>

          <View style={styles.overviewGrid}>
            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>CALORIES</Text>
              <Text style={styles.overviewValue}>{currentPlan.calories}</Text>
            </View>

            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>PROTEIN</Text>
              <Text style={styles.overviewValue}>
                {currentPlan.macros.protein}
              </Text>
            </View>

            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>CARBS</Text>
              <Text style={styles.overviewValue}>
                {currentPlan.macros.carbs}
              </Text>
            </View>

            <View style={styles.overviewBox}>
              <Text style={styles.overviewLabel}>FATS</Text>
              <Text style={styles.overviewValue}>
                {currentPlan.macros.fats}
              </Text>
            </View>
          </View>
        </View>

        {/* Meal Plan */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("meals")}
          >
            <Text style={styles.sectionTitle}>Meal Plan</Text>
            <Text style={styles.sectionArrow}>
              {expandedSections.meals ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedSections.meals && (
            <View style={styles.sectionContent}>
              {currentPlan.meals.map((meal: any, index: number) => (
                <View key={index} style={styles.mealItem}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealTime}>{meal.time}</Text>
                    <Text style={styles.mealCalories}>{meal.calories}</Text>
                  </View>
                  {meal.items.map((item: string, itemIndex: number) => (
                    <Text key={itemIndex} style={styles.mealItemText}>
                      • {item}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Nutrition Tips */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("tips")}
          >
            <Text style={styles.sectionTitle}>Nutrition Tips</Text>
            <Text style={styles.sectionArrow}>
              {expandedSections.tips ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedSections.tips && (
            <View style={styles.sectionContent}>
              {currentPlan.tips.map((tip: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
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
  titleSection: {
    padding: Spacing.md,
  },
  planTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  planDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  levelSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
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
  overviewSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  overviewBox: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm * 3) / 2,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  overviewLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
  },
  overviewValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
  },
  section: {
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
  sectionArrow: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  sectionContent: {
    paddingVertical: Spacing.md,
  },
  mealItem: {
    marginBottom: Spacing.lg,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  mealTime: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  mealCalories: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  mealItemText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  bulletPoint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
});
