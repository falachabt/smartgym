import { Text, View } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { getUserIdFromAuth } from "@/utils/database";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

interface PerformancesByMachine {
  machineId: number;
  machineName: string;
  exerciseName: string;
  exerciseId: number;
  performances: Array<{
    date: string;
    series: number;
    reps: number;
    charge: number | null;
  }>;
}

export default function HistoriqueScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupedPerformances, setGroupedPerformances] = useState<
    PerformancesByMachine[]
  >([]);
  const [expandedMachine, setExpandedMachine] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.id) {
        const id = await getUserIdFromAuth(user.id);
        setUserId(id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchGroupedPerformances = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("performances")
        .select(
          `
          *,
          exercices (
            exercice_id,
            titre_exercice,
            machine_id,
            machines (
              machine_id,
              nom_machine
            )
          )
        `,
        )
        .eq("utilisateur_id", userId)
        .order("date_scan", { ascending: false });

      if (!error && data) {
        const grouped: Record<string, PerformancesByMachine> = {};

        data.forEach((perf: any) => {
          if (!perf.exercices?.machines) return;

          const machineId = perf.exercices.machines.machine_id;
          const key = `machine_${machineId}`;

          if (!grouped[key]) {
            grouped[key] = {
              machineId,
              machineName: perf.exercices.machines.nom_machine,
              exerciseName: perf.exercices.titre_exercice,
              exerciseId: perf.exercices.exercice_id,
              performances: [],
            };
          }

          grouped[key].performances.push({
            date: perf.date_scan,
            series: perf.series_effectuees || 0,
            reps: perf.repetitions_effectuees || 0,
            charge: perf.charge_utilisee,
          });
        });

        setGroupedPerformances(Object.values(grouped));
      }
      setLoading(false);
    };

    fetchGroupedPerformances();
  }, [userId]);

  const handleOpenAddModal = () => {
    router.push("/(tabs)/scan");
  };

  const getChartData = (
    performances: PerformancesByMachine["performances"],
    type: "reps" | "charge",
  ) => {
    const sortedPerfs = [...performances]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-6);

    const labels = sortedPerfs.map((p) =>
      new Date(p.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
    );

    const data =
      type === "reps"
        ? sortedPerfs.map((p) => p.reps)
        : sortedPerfs.map((p) => p.charge || 0);

    return { labels, datasets: [{ data }] };
  };

  const getTotalVolume = (
    performances: PerformancesByMachine["performances"],
  ) => {
    return performances.reduce((total, perf) => {
      const volume = perf.series * perf.reps * (perf.charge || 0);
      return total + volume;
    }, 0);
  };

  const getAverageReps = (
    performances: PerformancesByMachine["performances"],
  ) => {
    if (performances.length === 0) return 0;
    const sum = performances.reduce((total, perf) => total + perf.reps, 0);
    return Math.round(sum / performances.length);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primary.dark}
        />
        <ActivityIndicator
          size="large"
          color={Colors.primary.main}
          style={{ marginTop: 100 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {groupedPerformances.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="bar-chart-outline"
              size={64}
              color={Colors.text.secondary}
            />
            <Text style={styles.emptyText}>Aucun historique disponible</Text>
            <Text style={styles.emptySubtext}>
              Complétez des exercices pour voir vos progrès
            </Text>
          </View>
        ) : (
          groupedPerformances.map((machineData) => (
            <View key={machineData.machineId} style={styles.machineCard}>
              <TouchableOpacity
                style={styles.machineHeader}
                onPress={() =>
                  setExpandedMachine(
                    expandedMachine === machineData.machineId
                      ? null
                      : machineData.machineId,
                  )
                }
              >
                <View style={styles.machineInfo}>
                  <Text style={styles.machineName}>
                    {machineData.machineName}
                  </Text>
                  <Text style={styles.exerciseName}>
                    {machineData.exerciseName}
                  </Text>
                  <Text style={styles.sessionCount}>
                    {machineData.performances.length} séance(s)
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedMachine === machineData.machineId
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color={Colors.primary.main}
                />
              </TouchableOpacity>

              {expandedMachine === machineData.machineId && (
                <View style={styles.machineDetails}>
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {getAverageReps(machineData.performances)}
                      </Text>
                      <Text style={styles.statLabel}>Reps moy.</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {Math.round(getTotalVolume(machineData.performances))}kg
                      </Text>
                      <Text style={styles.statLabel}>Volume total</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>
                        {machineData.performances[0]?.charge || 0}kg
                      </Text>
                      <Text style={styles.statLabel}>Dernier poids</Text>
                    </View>
                  </View>

                  {machineData.performances.length > 1 && (
                    <>
                      <Text style={styles.chartTitle}>
                        Évolution des répétitions
                      </Text>
                      <LineChart
                        data={getChartData(machineData.performances, "reps")}
                        width={Dimensions.get("window").width - Spacing.lg * 4}
                        height={180}
                        chartConfig={{
                          backgroundColor: Colors.background.card,
                          backgroundGradientFrom: Colors.background.card,
                          backgroundGradientTo: Colors.background.card,
                          decimalPlaces: 0,
                          color: (opacity = 1) => Colors.primary.main,
                          labelColor: (opacity = 1) => Colors.text.secondary,
                          style: { borderRadius: BorderRadius.md },
                          propsForDots: {
                            r: "4",
                            strokeWidth: "2",
                            stroke: Colors.primary.main,
                          },
                        }}
                        bezier
                        style={styles.chart}
                      />

                      {machineData.performances.some((p) => p.charge) && (
                        <>
                          <Text style={styles.chartTitle}>
                            Évolution de la charge
                          </Text>
                          <LineChart
                            data={getChartData(
                              machineData.performances,
                              "charge",
                            )}
                            width={
                              Dimensions.get("window").width - Spacing.lg * 4
                            }
                            height={180}
                            chartConfig={{
                              backgroundColor: Colors.background.card,
                              backgroundGradientFrom: Colors.background.card,
                              backgroundGradientTo: Colors.background.card,
                              decimalPlaces: 0,
                              color: (opacity = 1) =>
                                Colors.accent.orange || "#FFA500",
                              labelColor: (opacity = 1) =>
                                Colors.text.secondary,
                              style: { borderRadius: BorderRadius.md },
                              propsForDots: {
                                r: "4",
                                strokeWidth: "2",
                                stroke: Colors.accent.orange || "#FFA500",
                              },
                            }}
                            bezier
                            style={styles.chart}
                          />
                        </>
                      )}
                    </>
                  )}

                  <Text style={styles.listTitle}>Historique détaillé</Text>
                  {machineData.performances.map((perf, index) => (
                    <View key={index} style={styles.perfItem}>
                      <View style={styles.perfInfo}>
                        <Text style={styles.perfDetails}>
                          {perf.series} séries × {perf.reps} reps
                          {perf.charge && ` • ${perf.charge}kg`}
                        </Text>
                        <Text style={styles.perfDate}>
                          {new Date(perf.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fabButton} onPress={handleOpenAddModal}>
        <Ionicons name="add" size={28} color={Colors.primary.dark} />
      </TouchableOpacity>
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
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.primary.dark,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl * 2,
    backgroundColor: Colors.primary.dark,
  },
  emptyText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    backgroundColor: "transparent",
  },
  emptySubtext: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    backgroundColor: "transparent",
  },
  machineCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  machineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.background.card,
  },
  machineInfo: {
    flex: 1,
    backgroundColor: Colors.background.card,
  },
  machineName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.background.card,
  },
  exerciseName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.main,
    marginTop: Spacing.xs,
    backgroundColor: Colors.background.card,
  },
  sessionCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    backgroundColor: Colors.background.card,
  },
  machineDetails: {
    padding: Spacing.lg,
    paddingTop: 0,
    backgroundColor: Colors.background.card,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background.card,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.background.input,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.background.input,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    backgroundColor: Colors.background.input,
  },
  chartTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background.card,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  listTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background.card,
  },
  perfItem: {
    backgroundColor: Colors.background.input,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  perfInfo: {
    backgroundColor: Colors.background.input,
  },
  perfDetails: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: Colors.background.input,
  },
  perfDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    backgroundColor: Colors.background.input,
  },
  fabButton: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
