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

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress", user?.id],
    queryFn: () => progressService.getUserProgress(user?.id),
    enabled: !!user?.id,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["userSummary", user?.id],
    queryFn: () => progressService.getUserSummary(user?.id),
    enabled: !!user?.id,
  });

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["userAttempts", user?.id],
    queryFn: () => lessonService.getUserAttempts(user?.id),
    enabled: !!user?.id,
  });

  if (progressLoading || summaryLoading) return <LoadingScreen />;

  const completionPercentage = summary?.completion_percentage || 0;
  const recentAttempts = attempts?.slice(0, 5) || [];

  return (
    <ScrollView style={styles.container}>
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
                {attempts?.length || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Ejercicios Enviados
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {progress && progress.length > 0 && (
        <Card style={styles.modulesCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Progreso por Módulo
            </Text>

            {progress.map((moduleProgress) => (
              <View key={moduleProgress.id} style={styles.moduleProgress}>
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

      {recentAttempts.length > 0 && (
        <Card style={styles.attemptsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Intentos Recientes
            </Text>

            {recentAttempts.map((attempt) => (
              <View key={attempt.id} style={styles.attemptItem}>
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
              onPress={() => {
                /* Navegar a historial completo */
              }}
              style={styles.viewAllButton}
            >
              Ver Todos los Intentos
            </Button>
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
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
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
});
