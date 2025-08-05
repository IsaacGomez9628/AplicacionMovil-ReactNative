import { View, StyleSheet, ScrollView } from "react-native"
import { Text, Card, Button, Divider } from "react-native-paper"
import { useQuery } from "@tanstack/react-query"
import { moduleService } from "../../services/moduleService"
import LoadingScreen from "../LoadingScreen"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function ModuleDetailScreen({ route, navigation }) {
  const { moduleId } = route.params

  const {
    data: module,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: () => moduleService.getModule(moduleId),
  })

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["moduleLessons", moduleId],
    queryFn: () => moduleService.getModuleLessons(moduleId),
  })

  if (isLoading) return <LoadingScreen />

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Error al cargar el módulo</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {module.title}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {module.description}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Icon name="book-outline" size={20} color="#6366f1" />
              <Text style={styles.statText}>{lessons?.length || 0} lecciones</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="sort-numeric-ascending" size={20} color="#6366f1" />
              <Text style={styles.statText}>Posición: {module.position}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.lessonsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Lecciones del Módulo
          </Text>
          <Divider style={styles.divider} />

          {lessonsLoading ? (
            <Text>Cargando lecciones...</Text>
          ) : lessons && lessons.length > 0 ? (
            lessons
              .sort((a, b) => a.position - b.position)
              .map((lesson) => (
                <Card
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() => navigation.navigate("LessonDetail", { lessonId: lesson.id })}
                >
                  <Card.Content>
                    <View style={styles.lessonHeader}>
                      <View style={styles.lessonNumber}>
                        <Text style={styles.lessonNumberText}>{lesson.position}</Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text variant="titleSmall" style={styles.lessonTitle}>
                          {lesson.title}
                        </Text>
                        <View style={styles.lessonMeta}>
                          <Icon name="text" size={14} color="#6366f1" />
                          <Text style={styles.lessonType}>Teoría</Text>
                          {lesson.practice_instructions && (
                            <>
                              <Icon name="code-tags" size={14} color="#8b5cf6" style={{ marginLeft: 12 }} />
                              <Text style={[styles.lessonType, { color: "#8b5cf6" }]}>Práctica</Text>
                            </>
                          )}
                        </View>
                      </View>
                      <Icon name="chevron-right" size={24} color="#6b7280" />
                    </View>
                  </Card.Content>
                </Card>
              ))
          ) : (
            <View style={styles.emptyLessons}>
              <Icon name="book-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No hay lecciones disponibles</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Lessons", { moduleId })}
          style={styles.actionButton}
          icon="play"
        >
          Comenzar Lecciones
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  lessonsCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  lessonCard: {
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lessonNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  lessonDescription: {
    color: "#6b7280",
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonType: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6366f1",
  },
  emptyLessons: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    color: "#6b7280",
  },
  actionContainer: {
    padding: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    marginVertical: 16,
    textAlign: "center",
    color: "#ef4444",
  },
})
