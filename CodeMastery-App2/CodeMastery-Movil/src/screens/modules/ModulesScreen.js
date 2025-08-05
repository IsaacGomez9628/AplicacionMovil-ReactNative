import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, FAB } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../services/courseService";
import LoadingScreen from "../LoadingScreen";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function ModulesScreen({ route, navigation }) {
  const { courseId } = route.params;

  const {
    data: modules,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courseModules", courseId],
    queryFn: () => courseService.getCourseModules(courseId),
  });

  if (isLoading) return <LoadingScreen />;

  const renderModule = ({ item, index }) => (
    <Card
      style={styles.moduleCard}
      onPress={() => navigation.navigate("ModuleDetail", { moduleId: item.id })}
    >
      <Card.Content>
        <View style={styles.moduleHeader}>
          <View style={styles.moduleNumber}>
            <Text style={styles.moduleNumberText}>{item.position}</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text variant="titleMedium" style={styles.moduleTitle}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.moduleDescription}>
              {item.description}
            </Text>
            <View style={styles.moduleStats}>
              <Icon name="book-outline" size={16} color="#6b7280" />
              <Text style={styles.statText}>
                {item.lessons?.length || 0} lecciones
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#6b7280" />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={modules}
        renderItem={renderModule}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="book-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay módulos disponibles</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          /* Implementar creación de módulo */
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
  moduleCard: {
    marginBottom: 16,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  moduleNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  moduleNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  moduleDescription: {
    color: "#6b7280",
    marginBottom: 8,
  },
  moduleStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6b7280",
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
