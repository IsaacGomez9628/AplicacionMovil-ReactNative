"use client"
import { StyleSheet, ScrollView, Alert } from "react-native"
import { Text, Card, Button, Avatar, Divider, List } from "react-native-paper"
import { useAuth } from "../../context/AuthContext"

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar Sesión", onPress: logout, style: "destructive" },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text size={80} label={user?.name?.charAt(0)?.toUpperCase() || "U"} style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.name || "Usuario"}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
          {user?.role && (
            <Text variant="bodySmall" style={styles.role}>
              {user.role}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.menuCard}>
        <Card.Content>
          <List.Item
            title="Mi Progreso"
            description="Ver mi progreso de aprendizaje"
            left={(props) => <List.Icon {...props} icon="chart-line" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("Progress")}
          />

          <Divider />

          <List.Item
            title="Mis Intentos"
            description="Historial de ejercicios enviados"
            left={(props) => <List.Icon {...props} icon="code-tags" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("AttemptsHistory")}
          />

          <Divider />

          {user?.role === "admin" && (
            <>
              <List.Item
                title="Gestión de Usuarios"
                description="Administrar usuarios del sistema"
                left={(props) => <List.Icon {...props} icon="account-group" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate("Users")}
              />
              <Divider />
            </>
          )}

          <List.Item
            title="Configuración"
            description="Ajustes de la aplicación"
            left={(props) => <List.Icon {...props} icon="cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              /* Navegar a configuración */
            }}
          />

          <Divider />

          <List.Item
            title="Ayuda y Soporte"
            description="Obtener ayuda"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              /* Navegar a ayuda */
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            icon="logout"
            buttonColor="#ef4444"
            style={styles.logoutButton}
          >
            Cerrar Sesión
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: "#6366f1",
  },
  name: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    color: "#6b7280",
    marginBottom: 8,
  },
  role: {
    color: "#6366f1",
    textTransform: "capitalize",
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
  },
  actionCard: {
    margin: 16,
    marginTop: 8,
  },
  logoutButton: {
    paddingVertical: 8,
  },
})
