import { StyleSheet } from "react-native"
import { Button } from "react-native-paper"
import { darkColors } from "../theme/darkTheme"
import useResponsive from "../hooks/useResponsive"

const AuthButton = ({
  mode = "contained",
  variant = "primary",
  style,
  labelStyle,
  contentStyle,
  children,
  ...props
}) => {
  const { utils, spacing } = useResponsive()

  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return [
          styles.primaryButton,
          utils.getShadow("shadow"),
          {
            backgroundColor: darkColors.primary,
            paddingVertical: spacing.sm,
          },
        ]
      case "secondary":
        return [
          styles.secondaryButton,
          {
            borderColor: darkColors.outline,
            borderWidth: 1,
            paddingVertical: spacing.sm,
          },
        ]
      case "text":
        return [
          styles.textButton,
          {
            paddingVertical: spacing.xs,
          },
        ]
      default:
        return []
    }
  }

  const getLabelStyle = () => {
    switch (variant) {
      case "primary":
        return { color: "#FFFFFF", fontWeight: "600" }
      case "secondary":
        return { color: darkColors.primary, fontWeight: "600" }
      case "text":
        return { color: darkColors.primary, fontWeight: "500" }
      default:
        return {}
    }
  }

  const buttonStyle = [styles.button, ...getButtonStyle(), style]
  const buttonLabelStyle = [getLabelStyle(), labelStyle]
  const buttonContentStyle = [styles.buttonContent, contentStyle]

  return (
    <Button mode={mode} style={buttonStyle} labelStyle={buttonLabelStyle} contentStyle={buttonContentStyle} {...props}>
      {children}
    </Button>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  primaryButton: {
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
  textButton: {
    backgroundColor: "transparent",
  },
  buttonContent: {
    paddingVertical: 4,
  },
})

export default AuthButton
