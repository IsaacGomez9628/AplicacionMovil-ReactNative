// src/screens/progress/ProgressScreen.js - CORREGIDO
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, ProgressBar, Button } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { progressService } from "../../services/progressService";
import { lessonService } from "../../services/lessonService";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "../LoadingScreen";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function ProgressScreen({ navigation }) {
  const { user } = useAuth();

  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery({
    queryKey: ["userProgress", user?.id],
    queryFn: () => progressService.getUserProgress(user?.id),
    enabled: !!user?.id,
    retry: 2,
    onError: (error) => {
      console.error("❌ Progress query error:", error);
    },
    onSuccess: (data) => {
      console.log("✅ Progress data received:", data);
    },
  });

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["userSummary", user?.id],
    queryFn: () => progressService.getUserSummary(user?.id),
    enabled: !!user?.id,
    retry: 2,
    onError: (error) => {
      console.error("❌ Summary query error:", error);
    },
    onSuccess: (data) => {
      console.log("✅ Summary data received:", data);
    },
  });

  // ✅ CORREGIDO: Mejor manejo de la consulta de intentos
  const {
    data: attempts,
    isLoading: attemptsLoading,
    error: attemptsError,
  } = useQuery({
    queryKey: ["userAttempts"],
    queryFn: async () => {
      try {
        const result = await lessonService.getUserAttempts();
        console.log("✅ Attempts data received:", result);
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("❌ Error fetching attempts:", error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    initialData: [],
  });

  if (progressLoading || summaryLoading || attemptsLoading) {
    return <LoadingScreen message="Cargando tu progreso..." />;
  }

  if (progressError || summaryError || attemptsError) {
    console.error("❌ Screen errors:", {
      progress: progressError?.message,
      summary: summaryError?.message,
      attempts: attemptsError?.message,
    });
  }

  const completionPercentage = summary?.completion_percentage || 0;
  const safeAttempts = Array.isArray(attempts) ? attempts : [];
  const recentAttempts = safeAttempts.slice(0, 5);
  const safeProgress = Array.isArray(progress) ? progress : [];

  return (
    <ScrollView style={styles.container}>
      {/* DEBUG INFO - Solo en desarrollo */}
      {__DEV__ && (
        <Card style={[styles.summaryCard, { backgroundColor: "#fff3cd" }]}>
          <Card.Content>
            <Text variant="titleSmall" style={{ color: "#856404" }}>
              DEBUG INFO
            </Text>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              Progress: {safeProgress.length} items{"\n"}
              Summary: {summary ? "OK" : "NULL"}
              {"\n"}
              Attempts: {safeAttempts.length} items{"\n"}
              User ID: {user?.id || "NULL"}
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Mi Progreso
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text variant="titleMedium">Progreso General</Text>
              <Text variant="titleMedium" style={styles.percentage}>
                {Math.round(completionPercentage)}%
              </Text>
            </View>
            <ProgressBar
              progress={completionPercentage / 100}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="book-check" size={32} color="#10b981" />
              <Text variant="titleMedium" style={styles.statNumber}>
                {summary?.completed_modules || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Módulos Completados
              </Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="book-outline" size={32} color="#6b7280" />
              <Text variant="titleMedium" style={styles.statNumber}>
                {summary?.total_modules || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Módulos
              </Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="code-tags" size={32} color="#6366f1" />
              <Text variant="titleMedium" style={styles.statNumber}>
                {safeAttempts.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Ejercicios Enviados
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Progreso por módulos */}
      {safeProgress.length > 0 && (
        <Card style={styles.modulesCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Progreso por Módulo
            </Text>

            {safeProgress.map((moduleProgress, index) => (
              <View
                key={moduleProgress.id || index}
                style={styles.moduleProgress}
              >
                <View style={styles.moduleHeader}>
                  <Text variant="titleSmall" style={styles.moduleName}>
                    {moduleProgress.module?.title ||
                      `Módulo ${moduleProgress.module_id}`}
                  </Text>
                  <Icon
                    name={
                      moduleProgress.completed
                        ? "check-circle"
                        : "clock-outline"
                    }
                    size={20}
                    color={moduleProgress.completed ? "#10b981" : "#6b7280"}
                  />
                </View>
                <Text variant="bodySmall" style={styles.moduleStatus}>
                  {moduleProgress.completed
                    ? `Completado el ${new Date(
                        moduleProgress.completion_date
                      ).toLocaleDateString()}`
                    : "En progreso"}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Intentos recientes */}
      {recentAttempts.length > 0 && (
        <Card style={styles.attemptsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Intentos Recientes
            </Text>

            {recentAttempts.map((attempt, index) => (
              <View key={attempt.id || index} style={styles.attemptItem}>
                <View style={styles.attemptHeader}>
                  <Icon
                    name={attempt.is_correct ? "check-circle" : "close-circle"}
                    size={20}
                    color={attempt.is_correct ? "#10b981" : "#ef4444"}
                  />
                  <Text variant="titleSmall" style={styles.attemptLesson}>
                    Lección {attempt.lesson_id}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.attemptDate}>
                  {new Date(attempt.attempt_date).toLocaleDateString()}
                </Text>
              </View>
            ))}

            <Button
              mode="outlined"
              onPress={() => navigation.navigate("AttemptsHistory")}
              style={styles.viewAllButton}
            >
              Ver Todos los Intentos
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Mensaje cuando no hay datos */}
      {safeProgress.length === 0 &&
        recentAttempts.length === 0 &&
        !progressLoading && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <Icon name="chart-line" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>¡Comienza tu aprendizaje!</Text>
                <Text style={styles.emptyText}>
                  Aún no tienes progreso registrado. Explora los cursos
                  disponibles.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("Courses")}
                  style={styles.startButton}
                >
                  Ver Cursos
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 4, // ✅ Más espacio en contenedor
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 3,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  percentage: {
    color: "#6366f1",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    textAlign: "center",
    color: "#6b7280",
  },
  modulesCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  moduleProgress: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  moduleName: {
    flex: 1,
  },
  moduleStatus: {
    color: "#6b7280",
  },
  attemptsCard: {
    margin: 16,
    marginTop: 8,
  },
  attemptItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  attemptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  attemptLesson: {
    marginLeft: 8,
    flex: 1,
  },
  attemptDate: {
    color: "#6b7280",
  },
  viewAllButton: {
    marginTop: 16,
  },
  emptyCard: {
    margin: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  startButton: {
    paddingHorizontal: 24,
  },
});
