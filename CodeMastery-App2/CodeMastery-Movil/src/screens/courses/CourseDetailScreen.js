import { View, StyleSheet, FlatList } from "react-native";
import { Text, Button } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../services/courseService";
import SafeContainer from "../../components/SafeContainer";
import ResponsiveCard from "../../components/ResponsiveCard";
import LoadingScreen from "../LoadingScreen";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import useResponsive from "../../hooks/useResponsive";

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { spacing, fontSize, isTablet } = useResponsive();

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourse(courseId),
  });

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["courseModules", courseId],
    queryFn: () => courseService.getCourseModules(courseId),
  });

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <SafeContainer>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Error al cargar el curso</Text>
        </View>
      </SafeContainer>
    );
  }

  const renderHeader = () => (
    <ResponsiveCard style={styles.headerCard}>
      <View style={styles.courseHeader}>
        <View
          style={[
            styles.courseIcon,
            { backgroundColor: course.color_class || "#6366f1" },
          ]}
        >
          <Icon
            name={course.icon || "book"}
            size={isTablet ? 40 : 32}
            color="white"
          />
        </View>
        <View style={styles.courseInfo}>
          <Text
            variant={isTablet ? "headlineMedium" : "headlineSmall"}
            style={styles.title}
          >
            {course.title}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {course.description}
          </Text>
        </View>
      </View>

      <View style={[styles.statsContainer, { marginTop: spacing.md }]}>
        <View style={styles.stat}>
          <Icon name="book-outline" size={20} color="#6366f1" />
          <Text style={[styles.statText, { fontSize: fontSize.sm }]}>
            {modules?.length || 0} módulos
          </Text>
        </View>
        <View style={styles.stat}>
          <Icon name="calendar" size={20} color="#6366f1" />
          <Text style={[styles.statText, { fontSize: fontSize.sm }]}>
            Creado: {new Date(course.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </ResponsiveCard>
  );

  const renderModule = ({ item, index }) => (
    <ResponsiveCard
      onPress={() => navigation.navigate("ModuleDetail", { moduleId: item.id })}
      style={styles.moduleCard}
    >
      <View style={styles.moduleHeader}>
        <View style={styles.moduleNumber}>
          <Text style={styles.moduleNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.moduleInfo}>
          <Text variant="titleSmall" style={styles.moduleTitle}>
            {item.title}
          </Text>
          <Text
            variant="bodySmall"
            style={styles.moduleDescription}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <Text variant="bodySmall" style={styles.lessonsCount}>
            {item.lessons_count || 0} lecciones
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#6b7280" />
      </View>
    </ResponsiveCard>
  );

  const renderEmpty = () => (
    <View style={styles.emptyModules}>
      <Icon name="book-outline" size={48} color="#d1d5db" />
      <Text style={styles.emptyText}>No hay módulos disponibles</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={[styles.actionContainer, { paddingHorizontal: spacing.md }]}>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Modules", { courseId })}
        style={styles.actionButton}
        icon="book-open"
      >
        Explorar Módulos
      </Button>
    </View>
  );

  return (
    <SafeContainer>
      <FlatList
        data={modules}
        renderItem={renderModule}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={modulesLoading ? null : renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerCard: {
    marginTop: 8,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "#6b7280",
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
    color: "#6b7280",
  },
  moduleCard: {
    backgroundColor: "#f8fafc",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  moduleNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
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
    marginBottom: 4,
  },
  lessonsCount: {
    color: "#6366f1",
    fontSize: 12,
  },
  emptyModules: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    color: "#6b7280",
  },
  actionContainer: {
    paddingVertical: 16,
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
});
