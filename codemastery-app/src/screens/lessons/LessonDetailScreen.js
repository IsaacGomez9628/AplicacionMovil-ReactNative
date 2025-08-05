import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import { Text, Button, TextInput, Chip, Divider } from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonService } from "../../services/lessonService";
import { useAuth } from "../../context/AuthContext";
import SafeContainer from "../../components/SafeContainer";
import ResponsiveCard from "../../components/ResponsiveCard";
import LoadingScreen from "../LoadingScreen";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import useResponsive from "../../hooks/useResponsive";

export default function LessonDetailScreen({ route }) {
  const { lessonId } = route.params;
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();
  const { spacing, fontSize, isTablet, orientation } = useResponsive();

  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonService.getLesson(lessonId),
  });

  const { data: lastAttempt } = useQuery({
    queryKey: ["lastAttempt", lessonId, user?.id],
    queryFn: () => lessonService.getLastAttempt(lessonId, user?.id),
    enabled: !!user?.id && !!lesson?.practice_instructions,
  });

  const submitCodeMutation = useMutation({
    mutationFn: (codeSubmitted) =>
      lessonService.submitCode(lessonId, codeSubmitted),
    onSuccess: (data) => {
      Alert.alert(
        data.is_correct ? "¡Correcto!" : "Incorrecto",
        data.message ||
          (data.is_correct
            ? "Tu código es correcto"
            : "Revisa tu código e intenta de nuevo")
      );
      queryClient.invalidateQueries(["lastAttempt", lessonId, user?.id]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo enviar el código");
    },
  });

  useEffect(() => {
    if (lesson?.practice_initial_code && !code) {
      setCode(lesson.practice_initial_code);
    }
  }, [lesson]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <SafeContainer>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Error al cargar la lección</Text>
        </View>
      </SafeContainer>
    );
  }

  const handleSubmitCode = () => {
    if (!code.trim()) {
      Alert.alert("Error", "Por favor ingresa tu código");
      return;
    }
    submitCodeMutation.mutate(code);
  };

  const hasPractice =
    lesson.practice_instructions && lesson.practice_instructions.trim() !== "";

  const sections = [
    {
      id: "header",
      type: "header",
      data: lesson,
    },
    {
      id: "theory",
      type: "theory",
      data: lesson,
    },
    ...(hasPractice
      ? [
          {
            id: "practice",
            type: "practice",
            data: lesson,
          },
          {
            id: "code",
            type: "code",
            data: {
              lesson,
              code,
              setCode,
              handleSubmitCode,
              isLoading: submitCodeMutation.isPending,
            },
          },
          ...(lastAttempt
            ? [
                {
                  id: "attempt",
                  type: "attempt",
                  data: lastAttempt,
                },
              ]
            : []),
        ]
      : []),
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <ResponsiveCard style={styles.headerCard}>
            <View style={styles.lessonHeader}>
              <Text
                variant={isTablet ? "headlineMedium" : "headlineSmall"}
                style={[styles.title, { fontSize: fontSize.xl }]}
              >
                {item.data.title}
              </Text>
              <View style={[styles.lessonMeta, { marginTop: spacing.sm }]}>
                <Chip icon="text" style={styles.theoryChip}>
                  Teoría
                </Chip>
                {hasPractice && (
                  <Chip icon="code-tags" style={styles.practiceChip}>
                    Práctica
                  </Chip>
                )}
              </View>
            </View>
            <Text
              variant="bodySmall"
              style={[
                styles.position,
                { fontSize: fontSize.sm, marginTop: spacing.sm },
              ]}
            >
              Lección {item.data.position}
            </Text>
          </ResponsiveCard>
        );

      case "theory":
        return (
          <ResponsiveCard style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <Icon name="text" size={24} color="#6366f1" />
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { fontSize: fontSize.lg }]}
              >
                Teoría
              </Text>
            </View>
            <Text
              variant="bodyMedium"
              style={[
                styles.content,
                { fontSize: fontSize.md, lineHeight: fontSize.md * 1.5 },
              ]}
            >
              {item.data.theory}
            </Text>
          </ResponsiveCard>
        );

      case "practice":
        return (
          <ResponsiveCard style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <Icon name="code-tags" size={24} color="#8b5cf6" />
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { fontSize: fontSize.lg }]}
              >
                Ejercicio Práctico
              </Text>
            </View>
            <Text
              variant="bodyMedium"
              style={[
                styles.content,
                { fontSize: fontSize.md, lineHeight: fontSize.md * 1.5 },
              ]}
            >
              {item.data.practice_instructions}
            </Text>
          </ResponsiveCard>
        );

      case "code":
        return (
          <ResponsiveCard style={styles.codeCard}>
            <Text
              variant="titleMedium"
              style={[
                styles.sectionTitle,
                { fontSize: fontSize.lg, marginBottom: spacing.md },
              ]}
            >
              Tu Código
            </Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={isTablet ? 15 : 12}
              value={item.data.code}
              onChangeText={item.data.setCode}
              placeholder="Escribe tu código aquí..."
              style={[
                styles.codeInput,
                {
                  minHeight: isTablet ? 300 : 200,
                  marginBottom: spacing.md,
                },
              ]}
              contentStyle={[styles.codeContent, { fontSize: fontSize.sm }]}
            />
            <Button
              mode="contained"
              onPress={item.data.handleSubmitCode}
              loading={item.data.isLoading}
              disabled={item.data.isLoading}
              style={[styles.submitButton, { paddingVertical: spacing.sm }]}
              icon="send"
              labelStyle={{ fontSize: fontSize.md }}
            >
              Enviar Código
            </Button>
          </ResponsiveCard>
        );

      case "attempt":
        return (
          <ResponsiveCard style={styles.attemptCard}>
            <Text
              variant="titleMedium"
              style={[
                styles.sectionTitle,
                { fontSize: fontSize.lg, marginBottom: spacing.md },
              ]}
            >
              Último Intento
            </Text>
            <View style={styles.attemptHeader}>
              <Icon
                name={item.data.is_correct ? "check-circle" : "close-circle"}
                size={24}
                color={item.data.is_correct ? "#10b981" : "#ef4444"}
              />
              <Text
                style={[
                  styles.attemptStatus,
                  {
                    color: item.data.is_correct ? "#10b981" : "#ef4444",
                    fontSize: fontSize.md,
                  },
                ]}
              >
                {item.data.is_correct ? "Correcto" : "Incorrecto"}
              </Text>
            </View>
            <Text
              variant="bodySmall"
              style={[
                styles.attemptDate,
                { fontSize: fontSize.sm, marginBottom: spacing.md },
              ]}
            >
              {new Date(item.data.attempt_date).toLocaleString()}
            </Text>

            <Divider style={[styles.divider, { marginVertical: spacing.md }]} />

            <Text
              variant="titleSmall"
              style={[
                styles.submittedCodeTitle,
                { fontSize: fontSize.md, marginBottom: spacing.sm },
              ]}
            >
              Código enviado:
            </Text>
            <View style={styles.submittedCodeContainer}>
              <Text style={[styles.submittedCode, { fontSize: fontSize.xs }]}>
                {item.data.code_submitted}
              </Text>
            </View>
          </ResponsiveCard>
        );

      default:
        return null;
    }
  };

  return (
    <SafeContainer>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  headerCard: {
    marginTop: 8,
  },
  lessonHeader: {
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
  },
  lessonMeta: {
    flexDirection: "row",
    gap: 8,
  },
  theoryChip: {
    backgroundColor: "#e0f2fe",
  },
  practiceChip: {
    backgroundColor: "#ddd6fe",
  },
  position: {
    color: "#6b7280",
  },
  contentCard: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginLeft: 8,
  },
  content: {
    lineHeight: 22,
  },
  codeCard: {
    marginTop: 8,
  },
  codeInput: {
    backgroundColor: "transparent",
  },
  codeContent: {
    fontFamily: "monospace",
  },
  submitButton: {
    elevation: 2,
  },
  attemptCard: {
    marginTop: 8,
  },
  attemptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  attemptStatus: {
    marginLeft: 8,
    fontWeight: "bold",
  },
  attemptDate: {
    color: "#6b7280",
  },
  divider: {
    backgroundColor: "#e5e7eb",
  },
  submittedCodeTitle: {
    fontWeight: "bold",
  },
  submittedCodeContainer: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6366f1",
  },
  submittedCode: {
    fontFamily: "monospace",
    lineHeight: 16,
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
