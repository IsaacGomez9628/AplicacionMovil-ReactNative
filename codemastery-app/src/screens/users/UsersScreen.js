import React from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text, Card, Button, FAB, Searchbar, Chip } from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import LoadingScreen from "../LoadingScreen";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function UsersScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      Alert.alert("Éxito", "Usuario eliminado correctamente");
    },
    onError: () => {
      Alert.alert("Error", "No se pudo eliminar el usuario");
    },
  });

  const filteredUsers =
    users?.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (isLoading) return <LoadingScreen />;

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      "Eliminar Usuario",
      `¿Estás seguro de que quieres eliminar a ${userName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: () => deleteUserMutation.mutate(userId),
          style: "destructive",
        },
      ]
    );
  };

  const renderUser = ({ item }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text variant="titleMedium" style={styles.userName}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {item.email}
            </Text>
            <View style={styles.userMeta}>
              <Chip compact style={styles.roleChip}>
                {item.role || "student"}
              </Chip>
              <Text variant="bodySmall" style={styles.joinDate}>
                Registrado: {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.userActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => {
                /* Editar usuario */
              }}
              style={styles.actionButton}
            >
              Editar
            </Button>
            <Button
              mode="contained"
              compact
              buttonColor="#ef4444"
              onPress={() => handleDeleteUser(item.id, item.name)}
              style={styles.actionButton}
              loading={deleteUserMutation.isPending}
            >
              Eliminar
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar usuarios..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-group" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay usuarios disponibles</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          /* Crear usuario */
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
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    marginBottom: 16,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    color: "#6b7280",
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roleChip: {
    height: 24,
    backgroundColor: "#ddd6fe",
  },
  joinDate: {
    color: "#6b7280",
  },
  userActions: {
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
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
