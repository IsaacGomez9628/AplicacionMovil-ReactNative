// src/screens/profile/ProfileScreen.js - CORREGIDO
import { StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Card, Button, Avatar, Divider, List } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import TokenDebugger from "../../components/TokenDebugger";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar Sesión", onPress: logout, style: "destructive" },
      ]
    );
  };

  // ✅ Validación de usuario
  if (!user && !loading) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content style={styles.errorContent}>
            <Icon name="account-alert" size={48} color="#ef4444" />
            <Text variant="titleMedium" style={styles.errorTitle}>
              Error de Usuario
            </Text>
            <Text variant="bodyMedium" style={styles.errorText}>
              No se pudo cargar la información del usuario.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Login")}
              style={styles.errorButton}
            >
              Volver a Iniciar Sesión
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  if (__DEV__) {
    console.log("👤 ProfileScreen - User data:", user);
  }

  return (
    <ScrollView style={styles.container}>
      {/* Debug info en desarrollo */}
      {__DEV__ && (
        <Card style={styles.debugCard}>
          <Card.Content>
            <Text variant="titleSmall" style={{ color: "#856404" }}>
              DEBUG - USER INFO
            </Text>
            <Text style={{ fontSize: 12, color: "#856404" }}>
              ID: {user?.id || "NULL"}
              {"\n"}
              Name: {user?.name || "NULL"}
              {"\n"}
              Email: {user?.email || "NULL"}
              {"\n"}
              Loading: {loading ? "TRUE" : "FALSE"}
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0)?.toUpperCase() || "U"}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.name || "Usuario"}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email || "No disponible"}
          </Text>
          {user?.role && (
            <Text variant="bodySmall" style={styles.role}>
              {user.role}
            </Text>
          )}

          {user?.created_at && (
            <Text variant="bodySmall" style={styles.joinDate}>
              Miembro desde {new Date(user.created_at).toLocaleDateString()}
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

          {(user?.role === "admin" || user?.is_admin) && (
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
              Alert.alert(
                "Próximamente",
                "Esta función estará disponible en una próxima actualización."
              );
            }}
          />

          <Divider />

          <List.Item
            title="Ayuda y Soporte"
            description="Obtener ayuda"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                "Ayuda y Soporte",
                "Para obtener ayuda, contacta a: soporte@codemastery.com",
                [
                  { text: "OK" },
                  {
                    text: "Copiar Email",
                    onPress: () => {
                      Alert.alert("Email copiado", "soporte@codemastery.com");
                    },
                  },
                ]
              );
            }}
          />

          <Divider />

          <List.Item
            title="Acerca de"
            description="Información de la aplicación"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                "CodeMastery",
                "Versión 1.0.0\n\nAprende programación de forma interactiva y práctica.",
                [{ text: "OK" }]
              );
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
            loading={loading}
            disabled={loading}
          >
            {loading ? "Cerrando..." : "Cerrar Sesión"}
          </Button>
        </Card.Content>
      </Card>

      {__DEV__ && <TokenDebugger />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8, // ✅ Más espacio
  },
  debugCard: {
    margin: 16,
    backgroundColor: "#fff3cd",
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: "#6366f1",
  },
  name: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  email: {
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  role: {
    color: "#6366f1",
    textTransform: "capitalize",
    fontWeight: "500",
    marginBottom: 4,
  },
  joinDate: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 8,
  },
  actionCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  errorCard: {
    margin: 16,
    backgroundColor: "#fef2f2",
  },
  errorContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  errorTitle: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#dc2626",
  },
  errorText: {
    color: "#7f1d1d",
    textAlign: "center",
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: "#dc2626",
  },
});
