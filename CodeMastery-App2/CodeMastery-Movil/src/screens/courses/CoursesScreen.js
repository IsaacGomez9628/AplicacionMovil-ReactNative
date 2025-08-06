// src/screens/courses/CoursesScreen.js
import { useState, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, FAB, Searchbar } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../services/courseService";
import SafeContainer from "../../components/SafeContainer";
import ResponsiveCard from "../../components/ResponsiveCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import AnimatedButton from "../../components/AnimatedButton";
import ScreenTransition from "../../components/ScreenTransition";
import StatusIndicator from "../../components/StatusIndicator";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import useResponsive from "../../hooks/useResponsive";

export default function CoursesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showError, setShowError] = useState(false);
  const { spacing, isTablet, orientation, getResponsiveValue, utils } =
    useResponsive();

  const {
    data: courses,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: courseService.getCourses,
    onError: (error) => {
      console.error("Error loading courses:", error);
      setShowError(true);
    },
  });

  // ✅ CORREGIDO: Validar que courses sea un array antes de usar filter
  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    return courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  if (isLoading) {
    return (
      <SafeContainer safeAreaType="container">
        <LoadingSpinner
          type="dots"
          message="Cargando cursos..."
          overlay={false}
        />
      </SafeContainer>
    );
  }

  const numColumns = getResponsiveValue(1, 1, isTablet ? 2 : 1);
  const key = `${numColumns}-${orientation}`;

  const renderCourse = ({ item, index }) => (
    <ScreenTransition type="slideUp" delay={index * 100}>
      <ResponsiveCard
        onPress={() =>
          navigation.navigate("CourseDetail", { courseId: item.id })
        }
        shadowType="cardShadow"
        style={[
          styles.courseCard,
          {
            marginHorizontal:
              isTablet && numColumns > 1 ? spacing.xs : spacing.md,
            flex: isTablet && numColumns > 1 ? 1 : undefined,
          },
        ]}
      >
        <View style={styles.courseHeader}>
          <View
            style={[
              styles.courseIcon,
              { backgroundColor: item.color_class || "#6366f1" },
            ]}
          >
            <Icon name={item.icon || "book"} size={24} color="white" />
          </View>
          <View style={styles.courseInfo}>
            <Text variant="titleMedium" style={styles.courseTitle}>
              {item.title}
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.courseDescription}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#6b7280" />
        </View>
      </ResponsiveCard>
    </ScreenTransition>
  );

  const renderEmpty = () => (
    <ScreenTransition type="scaleIn">
      <View style={styles.emptyContainer}>
        <Icon name="book-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>
          {error ? "Error al cargar cursos" : "No hay cursos disponibles"}
        </Text>
        <AnimatedButton
          mode="outlined"
          onPress={() => refetch()}
          style={styles.retryButton}
          animationType="both"
          shadowType="lightShadow"
        >
          Reintentar
        </AnimatedButton>
      </View>
    </ScreenTransition>
  );

  const renderError = () => (
    <ScreenTransition type="slideUp">
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>
          {error?.response?.status === 401
            ? "Sesión expirada. Por favor inicia sesión nuevamente."
            : "Error al cargar los cursos"}
        </Text>
        <AnimatedButton
          mode="contained"
          onPress={() => {
            setShowError(false);
            refetch();
          }}
          style={styles.retryButton}
          animationType="scale"
          shadowType="shadow"
        >
          Reintentar
        </AnimatedButton>
      </View>
    </ScreenTransition>
  );

  // Si hay error y no hay datos, mostrar pantalla de error
  if (error && !courses) {
    return (
      <SafeContainer safeAreaType="container">{renderError()}</SafeContainer>
    );
  }

  return (
    <SafeContainer safeAreaType="container">
      <ScreenTransition type="fadeIn">
        <View style={styles.container}>
          <StatusIndicator
            type="error"
            message={
              error?.response?.status === 401
                ? "Sesión expirada"
                : "Error al cargar algunos cursos"
            }
            visible={showError}
            onHide={() => setShowError(false)}
          />

          <Searchbar
            placeholder="Buscar cursos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchbar,
              utils.getShadow("lightShadow"),
              { marginHorizontal: spacing.md },
            ]}
          />

          <FlatList
            key={key}
            data={filteredCourses}
            renderItem={renderCourse}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={[
              styles.listContainer,
              {
                paddingHorizontal: isTablet && numColumns > 1 ? spacing.md : 0,
              },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={["#6366f1"]}
                tintColor="#6366f1"
              />
            }
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={numColumns > 1 ? styles.row : null}
          />

          <FAB
            icon="plus"
            style={[
              styles.fab,
              utils.getShadow("shadow"),
              {
                bottom: spacing.lg,
                right: spacing.lg,
              },
            ]}
            onPress={() => {
              /* Implementar creación de curso */
            }}
          />
        </View>
      </ScreenTransition>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    marginVertical: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  listContainer: {
    paddingBottom: 100,
  },
  courseCard: {
    marginBottom: 8,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  courseDescription: {
    color: "#6b7280",
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
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    color: "#6b7280",
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  fab: {
    position: "absolute",
  },
  row: {
    justifyContent: "space-around",
  },
});
