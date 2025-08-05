import { StyleSheet } from "react-native"
import { Card } from "react-native-paper"
import { darkColors } from "../theme/darkTheme"
import useResponsive from "../hooks/useResponsive"

const AuthCard = ({ children, style, ...props }) => {
  const { spacing, utils, isTablet } = useResponsive()

  const cardStyle = [
    styles.card,
    utils.getShadow("cardShadow"),
    {
      backgroundColor: darkColors.cardBackground,
      padding: spacing.lg,
      maxWidth: isTablet ? 400 : "100%",
      width: "100%",
      alignSelf: "center",
    },
    style,
  ]

  return (
    <Card style={cardStyle} {...props}>
      <Card.Content style={styles.content}>{children}</Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 4,
  },
  content: {
    padding: 0,
  },
})

export default AuthCard
