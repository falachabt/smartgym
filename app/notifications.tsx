import { Text, View } from "@/components/Themed";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    TouchableOpacity,
} from "react-native";

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationDay {
  id: number;
  name: string;
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId?: string; // ID de la notification planifiée
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [days, setDays] = useState<NotificationDay[]>([
    { id: 1, name: "Lundi", enabled: true, hour: 18, minute: 0 },
    { id: 2, name: "Mardi", enabled: true, hour: 18, minute: 0 },
    { id: 3, name: "Mercredi", enabled: true, hour: 18, minute: 0 },
    { id: 4, name: "Jeudi", enabled: true, hour: 18, minute: 0 },
    { id: 5, name: "Vendredi", enabled: true, hour: 18, minute: 0 },
    { id: 6, name: "Samedi", enabled: false, hour: 10, minute: 0 },
    { id: 0, name: "Dimanche", enabled: false, hour: 10, minute: 0 },
  ]);
  const [editingDayId, setEditingDayId] = useState<number | null>(null);

  useEffect(() => {
    checkPermissions();
    loadSettings();
  }, []);

  const checkPermissions = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setHasPermission(finalStatus === "granted");

    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Vous devez autoriser les notifications pour recevoir des rappels.",
      );
    }
  };

  const loadSettings = async () => {
    try {
      const savedEnabled = await AsyncStorage.getItem("notificationsEnabled");
      const savedDays = await AsyncStorage.getItem("notificationDays");

      if (savedEnabled !== null) {
        setNotificationsEnabled(JSON.parse(savedEnabled));
      }
      if (savedDays !== null) {
        const loadedDays = JSON.parse(savedDays);
        // Migration: ajouter hour et minute si manquants
        const migratedDays = loadedDays.map((day: NotificationDay) => ({
          ...day,
          hour: day.hour ?? (day.id === 6 || day.id === 0 ? 10 : 18),
          minute: day.minute ?? 0,
          notificationId: day.notificationId,
        }));
        setDays(migratedDays);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        "notificationsEnabled",
        JSON.stringify(notificationsEnabled),
      );
      await AsyncStorage.setItem("notificationDays", JSON.stringify(days));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    }
  };

  const scheduleNotifications = async () => {
    if (!notificationsEnabled || !hasPermission) {
      return;
    }

    const now = new Date();
    const updatedDays = [...days];

    for (let i = 0; i < updatedDays.length; i++) {
      const day = updatedDays[i];

      // Annuler l'ancienne notification de ce jour si elle existe
      if (day.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          day.notificationId,
        );
        day.notificationId = undefined;
      }

      // Planifier une nouvelle notification si le jour est activé
      if (day.enabled && day.hour !== undefined && day.minute !== undefined) {
        // Calculer la prochaine occurrence de ce jour
        const targetDate = new Date();
        targetDate.setHours(day.hour);
        targetDate.setMinutes(day.minute);
        targetDate.setSeconds(0);
        targetDate.setMilliseconds(0);

        // Trouver le prochain jour correspondant
        const currentDay = targetDate.getDay();
        const targetDay = day.id;
        let daysUntilTarget = (targetDay - currentDay + 7) % 7;

        // Si c'est aujourd'hui mais l'heure est passée, programmer pour la semaine prochaine
        if (daysUntilTarget === 0 && targetDate <= now) {
          daysUntilTarget = 7;
        }

        targetDate.setDate(targetDate.getDate() + daysUntilTarget);

        try {
          // Planifier la notification avec un trigger de type date
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "💪 Heure d'aller à la salle !",
              body: `N'oubliez pas votre séance d'entraînement de ${day.name.toLowerCase()}.`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: targetDate,
              repeats: true,
            },
          });

          // Stocker l'ID de la notification
          day.notificationId = notificationId;
        } catch (error) {
          console.error(
            `Erreur lors de la planification pour ${day.name}:`,
            error,
          );
        }
      }
    }

    // Mettre à jour les days avec les nouveaux notificationIds
    setDays(updatedDays);
    await AsyncStorage.setItem("notificationDays", JSON.stringify(updatedDays));

    Alert.alert(
      "Notifications configurées",
      "Vos rappels ont été programmés avec succès !",
    );
  };

  const toggleNotifications = async (value: boolean) => {
    if (value && !hasPermission) {
      await checkPermissions();
      if (!hasPermission) {
        return;
      }
    }

    setNotificationsEnabled(value);
    await AsyncStorage.setItem("notificationsEnabled", JSON.stringify(value));

    if (value) {
      await scheduleNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const toggleDay = (dayId: number) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId ? { ...day, enabled: !day.enabled } : day,
      ),
    );
  };

  const changeDayTime = (
    dayId: number,
    increment: boolean,
    isHour: boolean,
  ) => {
    setDays((prevDays) =>
      prevDays.map((day) => {
        if (day.id !== dayId) return day;

        if (isHour) {
          const currentHour = day.hour ?? 18;
          let newHour = increment ? currentHour + 1 : currentHour - 1;
          if (newHour < 0) newHour = 23;
          if (newHour > 23) newHour = 0;
          return { ...day, hour: newHour };
        } else {
          const currentMinute = day.minute ?? 0;
          let newMinute = increment ? currentMinute + 1 : currentMinute - 1;
          if (newMinute < 0) newMinute = 59;
          if (newMinute > 59) newMinute = 0;
          return { ...day, minute: newMinute };
        }
      }),
    );
  };

  const changeDayTimeBy = (dayId: number, minutesDelta: number) => {
    setDays((prevDays) =>
      prevDays.map((day) => {
        if (day.id !== dayId) return day;

        const currentMinute = day.minute ?? 0;
        let newMinute = currentMinute + minutesDelta;
        if (newMinute < 0) newMinute = 60 + (newMinute % 60);
        if (newMinute > 59) newMinute = newMinute % 60;
        return { ...day, minute: newMinute };
      }),
    );
  };

  const applyChanges = async () => {
    await saveSettings();
    await scheduleNotifications();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.dark}
      />

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Enable/Disable Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="notifications"
              size={24}
              color={Colors.primary.main}
            />
            <Text style={styles.sectionTitle}>Rappels d'entraînement</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Activer les notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{
                  false: Colors.background.light,
                  true: Colors.primary.main,
                }}
                thumbColor={Colors.text.primary}
              />
            </View>
          </View>
        </View>

        {notificationsEnabled && hasPermission && (
          <>
            {/* Days Selection with Individual Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="calendar"
                  size={24}
                  color={Colors.primary.main}
                />
                <Text style={styles.sectionTitle}>Jours et horaires</Text>
              </View>
              <View style={styles.card}>
                {days.map((day) => (
                  <View key={day.id}>
                    <TouchableOpacity
                      style={[
                        styles.dayItem,
                        day.enabled && styles.dayItemActive,
                      ]}
                      onPress={() => toggleDay(day.id)}
                    >
                      <View style={styles.dayInfo}>
                        <Text
                          style={[
                            styles.dayText,
                            day.enabled && styles.dayTextActive,
                          ]}
                        >
                          {day.name}
                        </Text>
                        {day.enabled &&
                          day.hour !== undefined &&
                          day.minute !== undefined && (
                            <Text style={styles.dayTimeText}>
                              {day.hour.toString().padStart(2, "0")}:
                              {day.minute.toString().padStart(2, "0")}
                            </Text>
                          )}
                      </View>
                      <View style={styles.dayActions}>
                        {day.enabled && (
                          <TouchableOpacity
                            style={styles.editTimeButton}
                            onPress={() => setEditingDayId(day.id)}
                          >
                            <Ionicons
                              name="time"
                              size={20}
                              color={Colors.primary.main}
                            />
                          </TouchableOpacity>
                        )}
                        {day.enabled && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={Colors.primary.main}
                          />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Time Editor for this day */}
                    {editingDayId === day.id &&
                      day.enabled &&
                      day.hour !== undefined &&
                      day.minute !== undefined && (
                        <View style={styles.timeEditor}>
                          <Text style={styles.timeEditorTitle}>
                            Heure pour {day.name}
                          </Text>
                          <View style={styles.timePicker}>
                            <View style={styles.timeControl}>
                              <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() =>
                                  changeDayTime(day.id, true, true)
                                }
                              >
                                <Ionicons
                                  name="chevron-up"
                                  size={24}
                                  color={Colors.primary.main}
                                />
                              </TouchableOpacity>
                              <Text style={styles.timeValue}>
                                {(day.hour ?? 18).toString().padStart(2, "0")}
                              </Text>
                              <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() =>
                                  changeDayTime(day.id, false, true)
                                }
                              >
                                <Ionicons
                                  name="chevron-down"
                                  size={24}
                                  color={Colors.primary.main}
                                />
                              </TouchableOpacity>
                            </View>

                            <Text style={styles.timeSeparator}>:</Text>

                            <View style={styles.timeControl}>
                              <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() =>
                                  changeDayTime(day.id, true, false)
                                }
                              >
                                <Ionicons
                                  name="chevron-up"
                                  size={24}
                                  color={Colors.primary.main}
                                />
                              </TouchableOpacity>
                              <Text style={styles.timeValue}>
                                {(day.minute ?? 0).toString().padStart(2, "0")}
                              </Text>
                              <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() =>
                                  changeDayTime(day.id, false, false)
                                }
                              >
                                <Ionicons
                                  name="chevron-down"
                                  size={24}
                                  color={Colors.primary.main}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Quick minute adjustments */}
                          <View style={styles.quickMinutes}>
                            <Text style={styles.quickMinutesLabel}>
                              Ajustement rapide :
                            </Text>
                            <View style={styles.quickMinutesButtons}>
                              <TouchableOpacity
                                style={styles.quickButton}
                                onPress={() => changeDayTimeBy(day.id, -10)}
                              >
                                <Text style={styles.quickButtonText}>-10</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.quickButton}
                                onPress={() => changeDayTimeBy(day.id, -5)}
                              >
                                <Text style={styles.quickButtonText}>-5</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.quickButton}
                                onPress={() => changeDayTimeBy(day.id, 5)}
                              >
                                <Text style={styles.quickButtonText}>+5</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.quickButton}
                                onPress={() => changeDayTimeBy(day.id, 10)}
                              >
                                <Text style={styles.quickButtonText}>+10</Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={styles.closeEditorButton}
                            onPress={() => setEditingDayId(null)}
                          >
                            <Text style={styles.closeEditorText}>Fermer</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                  </View>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton} onPress={applyChanges}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary.dark}
              />
              <Text style={styles.applyButtonText}>
                Appliquer les modifications
              </Text>
            </TouchableOpacity>
          </>
        )}

        {!hasPermission && (
          <View style={styles.permissionWarning}>
            <Ionicons name="warning" size={48} color={Colors.accent.orange} />
            <Text style={styles.warningTitle}>Permissions requises</Text>
            <Text style={styles.warningText}>
              Vous devez autoriser les notifications dans les paramètres de
              votre appareil pour recevoir des rappels.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={checkPermissions}
            >
              <Text style={styles.permissionButtonText}>
                Vérifier les permissions
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
    backgroundColor: Colors.primary.dark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.primary.dark,
  },
  placeholder: {
    width: 40,
    backgroundColor: Colors.primary.dark,
  },
  section: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary.dark,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.primary.dark,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background.card,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: Colors.background.card,
  },
  timePicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
    backgroundColor: Colors.background.card,
  },
  timeControl: {
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.background.card,
  },
  timeButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.background.card,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    minWidth: 80,
    textAlign: "center",
    backgroundColor: Colors.background.card,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.background.card,
  },
  dayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.light,
  },
  dayItemActive: {
    backgroundColor: Colors.primary.main + "20",
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  dayInfo: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: "transparent",
  },
  dayTextActive: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    backgroundColor: "transparent",
  },
  dayTimeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
    backgroundColor: "transparent",
  },
  dayActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  editTimeButton: {
    padding: Spacing.xs,
    backgroundColor: "transparent",
  },
  timeEditor: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timeEditorTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
    backgroundColor: Colors.background.input,
  },
  quickMinutes: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.background.input,
  },
  quickMinutesLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.input,
  },
  quickMinutesButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.background.input,
  },
  quickButton: {
    backgroundColor: Colors.primary.main + "40",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  quickButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    backgroundColor: "transparent",
  },
  closeEditorButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    alignItems: "center",
  },
  closeEditorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
    backgroundColor: Colors.primary.main,
  },
  applyButton: {
    backgroundColor: Colors.primary.main,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  applyButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
    backgroundColor: Colors.primary.main,
  },
  permissionWarning: {
    alignItems: "center",
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary.dark,
  },
  warningTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primary.dark,
  },
  warningText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary.dark,
  },
  permissionButton: {
    backgroundColor: Colors.accent.orange,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  permissionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
    backgroundColor: Colors.accent.orange,
  },
});
