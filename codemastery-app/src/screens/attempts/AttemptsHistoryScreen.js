"use client"

import React from "react"
import { View, StyleSheet, FlatList, Alert } from "react-native"
import { Text, Card, Button, Searchbar, Chip } from "react-native-paper"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { lessonService } from "../../services/lessonService"
import { useAuth } from "../../context/AuthContext"
import LoadingScreen from "../LoadingScreen"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function AttemptsHistoryScreen() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: attempts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userAttempts", user?.id],
    queryFn: () => lessonService.getUserAttempts(user?.id),
    enabled: !!user?.id,
  })

  const deleteAttemptMutation = useMutation({
    mutationFn: lessonService.deleteAttempt,
    onSuccess: () => {
      queryClient.invalidateQueries(["userAttempts", user?.id])
      Alert.alert("Éxito", "Intento eliminado correctamente")
    },
    onError: () => {
      Alert.alert("Error", "No se pudo eliminar el intento")
    },
  })

  const filteredAttempts =
    attempts?.filter(
      (attempt) =>
        attempt.lesson_id.toString().includes(searchQuery) ||
        attempt.code_submitted.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  if (isLoading) return <LoadingScreen />

  const handleDeleteAttempt = (attemptId) => {
    Alert.alert("Eliminar Intento", "¿Estás seguro de que quieres eliminar este intento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        onPress: () => deleteAttemptMutation.mutate(attemptId),
        style: "destructive",
      },
    ])
  }

  const renderAttempt = ({ item }) => (
    <Card style={styles.attemptCard}>
      <Card.Content>
        <View style={styles.attemptHeader}>
          <View style={styles.attemptInfo}>
            <Text variant="titleMedium" style={styles.lessonTitle}>
              Lección {item.lesson_id}
            </Text>
            <View style={styles.attemptMeta}>
              <Chip
                icon={item.is_correct ? "check-circle" : "close-circle"}
                style={[styles.statusChip, item.is_correct ? styles.correctChip : styles.incorrectChip]}
                compact
              >
                {item.is_correct ? "Correcto" : "Incorrecto"}
              </Chip>
              <Text variant="bodySmall" style={styles.attemptDate}>
                {new Date(item.attempt_date).toLocaleString()}
              </Text>
            </View>
          </View>
          <Button
            mode="outlined"
            compact
            onPress={() => handleDeleteAttempt(item.id)}
            loading={deleteAttemptMutation.isPending}
            buttonColor="#ef4444"
            textColor="#ef4444"
          >
            Eliminar
          </Button>
        </View>

        <View style={styles.codeContainer}>
          <Text variant="titleSmall" style={styles.codeTitle}>
            Código enviado:
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {item.code_submitted.length > 200 ? `${item.code_submitted.substring(0, 200)}...` : item.code_submitted}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar intentos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredAttempts}
        renderItem={renderAttempt}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="code-tags" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay intentos disponibles</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  attemptCard: {
    marginBottom: 16,
    elevation: 2,
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  attemptInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  attemptMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusChip: {
    height: 24,
  },
  correctChip: {
    backgroundColor: "#dcfce7",
  },
  incorrectChip: {
    backgroundColor: "#fef2f2",
  },
  attemptDate: {
    color: "#6b7280",
  },
  codeContainer: {
    marginTop: 8,
  },
  codeTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6366f1",
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 16,
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
})
