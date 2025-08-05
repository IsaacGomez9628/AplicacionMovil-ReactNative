import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function ModuleCard({ module, onPress, showPosition = true }) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          {showPosition && (
            <View style={styles.position}>
              <Text style={styles.positionText}>{module.position}</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.title}>
              {module.title}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {module.description}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#6b7280" />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  position: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  positionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#6b7280",
  },
});
