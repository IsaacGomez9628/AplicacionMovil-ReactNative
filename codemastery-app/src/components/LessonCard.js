import { StyleSheet, View } from "react-native"
import { Card, Text, Chip } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function LessonCard({ lesson, onPress, showPosition = true }) {
  const hasPractice = lesson.practice_instructions && lesson.practice_instructions.trim() !== ""

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          {showPosition && (
            <View style={styles.position}>
              <Text style={styles.positionText}>{lesson.position}</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.title}>
              {lesson.title}
            </Text>
            <View style={styles.meta}>
              <Chip icon="text" compact style={styles.theoryChip}>
                Teoría
              </Chip>
              {hasPractice && (
                <Chip icon="code-tags" compact style={styles.practiceChip}>
                  Práctica
                </Chip>
              )}
            </View>
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
  position: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8b5cf6",
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
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    gap: 8,
  },
  theoryChip: {
    backgroundColor: "#e0f2fe",
    height: 24,
  },
  practiceChip: {
    backgroundColor: "#ddd6fe",
    height: 24,
  },
})
