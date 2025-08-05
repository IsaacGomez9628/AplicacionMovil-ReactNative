import { StyleSheet } from "react-native"
import { Card, ActivityIndicator } from "react-native-paper"

export default function LoadingCard({ height = 100 }) {
  return (
    <Card style={[styles.card, { height }]}>
      <Card.Content style={styles.content}>
        <ActivityIndicator size="large" />
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
