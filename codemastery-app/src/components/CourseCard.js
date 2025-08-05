import { StyleSheet, View } from "react-native"
import { Card, Text } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function CourseCard({ course, onPress }) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={[styles.icon, { backgroundColor: course.color_class || "#6366f1" }]}>
            <Icon name={course.icon || "book"} size={24} color="white" />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.title}>
              {course.title}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {course.description}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#6b7280" />
        </View>
      </Card.Content>
    </Card>
  )
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
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
})
