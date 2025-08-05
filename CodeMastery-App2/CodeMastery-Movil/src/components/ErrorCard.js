import { StyleSheet } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function ErrorCard({ message, onRetry }) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Icon name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <Button mode="contained" onPress={onRetry} style={styles.button}>
            Reintentar
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  content: {
    alignItems: "center",
    paddingVertical: 32,
  },
  message: {
    marginVertical: 16,
    textAlign: "center",
    color: "#ef4444",
  },
  button: {
    marginTop: 8,
  },
});
