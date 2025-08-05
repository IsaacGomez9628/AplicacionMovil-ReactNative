import { StyleSheet } from "react-native"
import { Card } from "react-native-paper"
import useResponsive from "../hooks/useResponsive"

const ResponsiveCard = ({ children, style, shadowType = "cardShadow", ...props }) => {
  const { spacing, isTablet, orientation, utils } = useResponsive()

  // ✅ SOLUCIÓN: Usar utils.getShadow para evitar undefined
  const shadowStyle = utils.getShadow(shadowType)

  const cardStyle = [
    styles.card,
    shadowStyle, // ✅ Siempre definido gracias a utils
    {
      marginHorizontal: spacing.md,
      marginVertical: spacing.sm,
      padding: spacing.md,
      maxWidth: isTablet && orientation === "landscape" ? "48%" : "100%",
      alignSelf: isTablet && orientation === "landscape" ? "flex-start" : "stretch",
    },
    style,
  ]

  return (
    <Card style={cardStyle} {...props}>
      {children}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
})

export default ResponsiveCard
