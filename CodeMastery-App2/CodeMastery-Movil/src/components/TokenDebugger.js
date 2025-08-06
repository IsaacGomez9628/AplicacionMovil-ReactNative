// ✅ COMPONENTE ACTUALIZADO: src/components/TokenDebugger.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Card, Text, Button, Chip } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { testCompleteAuthFlow, getTokenStatus } from "../services/api"; // ✅ AGREGAR IMPORTS

const TokenDebugger = () => {
  const [tokenInfo, setTokenInfo] = useState({
    hasToken: false,
    isExpiring: false,
    timeRemaining: 0,
    isValid: false,
  });
  const [loading, setLoading] = useState(false);
  const { tokenExpiring, refreshTokens } = useAuth();

  // Actualizar info del token cada 10 segundos
  useEffect(() => {
    const updateTokenInfo = async () => {
      try {
        const hasToken = await authService.hasValidToken();
        const isExpiring = await authService.isTokenExpiringSoon();
        const timeRemaining = await authService.getTokenTimeRemaining();
        const validation = await authService.validateCurrentToken();

        setTokenInfo({
          hasToken,
          isExpiring,
          timeRemaining,
          isValid: validation.valid,
        });
      } catch (error) {
        console.error("Error updating token info:", error);
      }
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const result = await refreshTokens();
      if (result.success) {
        Alert.alert("✅ Éxito", "Token refrescado manualmente");
      } else {
        Alert.alert("❌ Error", result.error);
      }
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateToken = async () => {
    setLoading(true);
    try {
      const validation = await authService.validateCurrentToken();
      Alert.alert(
        validation.valid ? "✅ Token Válido" : "❌ Token Inválido",
        validation.valid
          ? `Usuario: ${validation.user?.email}`
          : `Error: ${validation.error}`
      );
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Test completo de auth flow
  const handleCompleteAuthTest = async () => {
    setLoading(true);
    try {
      console.log("🧪 Starting complete auth flow test...");
      const result = await testCompleteAuthFlow();

      const message = result.success
        ? `✅ Test Completo Exitoso\n\n${JSON.stringify(
            result.results,
            null,
            2
          )}`
        : `❌ Test Falló\n\nError: ${
            result.error
          }\nResultados: ${JSON.stringify(result.results, null, 2)}`;

      Alert.alert(
        result.success ? "✅ Auth Test Exitoso" : "❌ Auth Test Falló",
        message,
        [{ text: "OK" }],
        { cancelable: true }
      );

      console.log("🧪 Complete auth test result:", result);
    } catch (error) {
      Alert.alert("❌ Error en Test", error.message);
      console.error("❌ Complete auth test error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Mostrar estado de tokens
  const handleShowTokenStatus = async () => {
    setLoading(true);
    try {
      const status = await getTokenStatus();

      const message = `Estado de Tokens:
      
🔑 Tiene tokens: ${status.hasTokens ? "Sí" : "No"}
⏰ Expirando pronto: ${status.isExpiring ? "Sí" : "No"}
📅 Expires In: ${status.expiresIn || "N/A"}s
🕐 Login Time: ${status.loginTimestamp || "N/A"}

Access Token: ${status.accessToken || "None"}
Refresh Token: ${status.refreshToken || "None"}`;

      Alert.alert("📊 Estado de Tokens", message);
      console.log("📊 Token status:", status);
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceExpiry = async () => {
    Alert.alert(
      "⚠️ Advertencia",
      "Esto forzará la expiración del token para probar el refresh automático",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          onPress: async () => {
            try {
              // Simular token expirado modificando el timestamp
              const AsyncStorage =
                require("@react-native-async-storage/async-storage").default;
              await AsyncStorage.setItem("login_timestamp", "0");
              Alert.alert(
                "⚠️ Token Forzado a Expirar",
                "El próximo request debería refrescar automáticamente"
              );
            } catch (error) {
              Alert.alert("❌ Error", error.message);
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          🔐 Token Debugger
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado del Token:</Text>
            <Chip
              icon={tokenInfo.hasToken ? "check" : "close"}
              style={[
                styles.chip,
                tokenInfo.hasToken ? styles.successChip : styles.errorChip,
              ]}
            >
              {tokenInfo.hasToken ? "Presente" : "Ausente"}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Validez:</Text>
            <Chip
              icon={tokenInfo.isValid ? "check-circle" : "alert-circle"}
              style={[
                styles.chip,
                tokenInfo.isValid ? styles.successChip : styles.warningChip,
              ]}
            >
              {tokenInfo.isValid ? "Válido" : "Inválido"}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Próximo a Expirar:</Text>
            <Chip
              icon={tokenInfo.isExpiring ? "clock-alert" : "clock-check"}
              style={[
                styles.chip,
                tokenInfo.isExpiring ? styles.warningChip : styles.successChip,
              ]}
            >
              {tokenInfo.isExpiring ? "Sí" : "No"}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Tiempo Restante:</Text>
            <Text style={styles.timeText}>
              {formatTime(tokenInfo.timeRemaining)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Auto-Refresh Activo:</Text>
            <Chip
              icon={tokenExpiring ? "refresh" : "refresh-off"}
              style={[
                styles.chip,
                tokenExpiring ? styles.warningChip : styles.infoChip,
              ]}
            >
              {tokenExpiring ? "Refrescando..." : "Inactivo"}
            </Chip>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleValidateToken}
            loading={loading}
            style={styles.button}
          >
            Validar Token
          </Button>

          <Button
            mode="contained"
            onPress={handleManualRefresh}
            loading={loading}
            style={styles.button}
          >
            Refresh Manual
          </Button>

          {/* ✅ NUEVOS BOTONES */}
          <Button
            mode="contained"
            onPress={handleCompleteAuthTest}
            loading={loading}
            style={[styles.button, { backgroundColor: "#10b981" }]}
          >
            🧪 Test Completo Auth
          </Button>

          <Button
            mode="outlined"
            onPress={handleShowTokenStatus}
            loading={loading}
            style={styles.button}
          >
            📊 Estado Tokens
          </Button>

          <Button
            mode="outlined"
            onPress={handleForceExpiry}
            buttonColor="#f59e0b"
            style={styles.button}
          >
            Forzar Expiración
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  chip: {
    height: 28,
  },
  successChip: {
    backgroundColor: "#dcfce7",
  },
  errorChip: {
    backgroundColor: "#fef2f2",
  },
  warningChip: {
    backgroundColor: "#fef3c7",
  },
  infoChip: {
    backgroundColor: "#dbeafe",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6366f1",
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    marginBottom: 4,
  },
});

export default TokenDebugger;
