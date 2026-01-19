import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface UpdateModalProps {
  visible: boolean;
  onInstall: () => void;
  onLater: () => void;
  isInstalling: boolean;
}

export default function UpdateModal({
  visible,
  onInstall,
  onLater,
  isInstalling,
}: UpdateModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="download-outline"
              size={64}
              color={Colors.primary.main}
            />
          </View>

          <Text style={styles.title}>Mise à jour disponible</Text>
          <Text style={styles.message}>
            Une nouvelle version de l'application est disponible avec des
            améliorations et corrections.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.buttonPrimary,
                isInstalling && styles.buttonDisabled,
              ]}
              onPress={onInstall}
              disabled={isInstalling}
            >
              {isInstalling ? (
                <ActivityIndicator color={Colors.primary.dark} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary.dark}
                  />
                  <Text style={styles.buttonPrimaryText}>
                    Installer maintenant
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={onLater}
              disabled={isInstalling}
            >
              <Text style={styles.buttonSecondaryText}>Plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  message: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPrimaryText: {
    color: Colors.primary.dark,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
});
