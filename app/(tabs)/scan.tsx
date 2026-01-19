import { BorderRadius, Colors, Spacing, Typography } from "@/constants/Styles";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SCAN_AREA_SIZE = Math.min(SCREEN_WIDTH * 0.75, 300);

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState({ type: "", data: "" });

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Nous avons besoin de votre permission pour utiliser la caméra
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setScannedData({ type, data });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // Réactiver le scan automatiquement après la fermeture du modal
    setTimeout(() => {
      setScanned(false);
    }, 300);
  };

  const handleViewMachine = () => {
    setModalVisible(false);
    // Navigate to machine details page with the scanned data
    router.push(`/machine/${scannedData.data}`);
    // Reset scan after navigation
    setTimeout(() => {
      setScanned(false);
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan Machine</Text>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
      </View>

      {/* Scanning frame overlay */}
      <View style={styles.scanFrame}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* Instructions */}
      <View style={styles.footer}>
        <Text style={styles.instructions}>
          Point your camera at the QR code on the machine.
        </Text>

        {/* Flashlight icon */}
        {/* <View style={styles.flashlightIcon}>
          <Text style={styles.flashlightText}>🔦</Text>
        </View> */}
      </View>

      {/* Modal for scanned data */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code Scanné!</Text>
            <View style={styles.modalDataContainer}>
              <Text style={styles.modalLabel}>Machine détectée:</Text>
              <Text style={styles.modalData}>{scannedData.data}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonTextSecondary}>
                  Scanner une autre
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleViewMachine}
              >
                <Text style={styles.modalButtonText}>Voir les détails</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    alignSelf: "center",
    zIndex: 10,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: Spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: BorderRadius.full,
  },
  closeButtonText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  scanFrame: {
    position: "absolute",
    top: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
    left: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    pointerEvents: "none",
  },
  corner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderColor: Colors.primary.main,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: BorderRadius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: BorderRadius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: BorderRadius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: BorderRadius.md,
  },
  footer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 80,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  instructions: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  flashlightIcon: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: BorderRadius.full,
  },
  flashlightText: {
    fontSize: Typography.fontSize.xl,
  },
  message: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xl,
  },
  buttonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  modalDataContainer: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  modalData: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: Colors.background.input,
  },
  modalButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.dark,
  },
  modalButtonTextSecondary: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
