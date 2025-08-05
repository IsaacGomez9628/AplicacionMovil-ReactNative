import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, FAB, Chip } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { moduleService } from "../../services/moduleService";
import LoadingScreen from "../LoadingScreen";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function LessonsScreen({ route, navigation }) {
  const { moduleId } = route.params;

  const {
    data: lessons,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["moduleLessons", moduleId],
    queryFn: () => moduleService.getModuleLessons(moduleId),
  });

  if (isLoading) return <LoadingScreen />;

  const renderLesson = ({ item }) => (
    <Card
      style={styles.lessonCard}
      onPress={() => navigation.navigate("LessonDetail", { lessonId: item.id })}
    >
      <Card.Content>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>{item.position}</Text>
          </View>
          <View style={styles.lessonInfo}>
            <Text variant="titleMedium" style={styles.lessonTitle}>
              {item.title}
            </Text>
            <View style={styles.lessonMeta}>
              <Chip icon="text" compact style={styles.theoryChip}>
                Teoría
              </Chip>
              {item.practice_instructions && (
                <Chip icon="code-tags" compact style={styles.practiceChip}>
                  Práctica
                </Chip>
              )}
            </View>
          </View>
          <View style={styles.lessonActions}>
            <Icon name="chevron-right" size={24} color="#6b7280" />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="book-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay lecciones disponibles</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          /* Implementar creación de lección */
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  listContainer: {
    padding: 16,
  },
  lessonCard: {
    marginBottom: 16,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lessonNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    height: 24,
  },
  practiceChip: {
    backgroundColor: "#ddd6fe",
  },
  theoryChip: {
    backgroundColor: "#e0f2fe",
  },
  difficultyChip: {
    height: 24,
    backgroundColor: "#fef3c7",
  },
  lessonActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
