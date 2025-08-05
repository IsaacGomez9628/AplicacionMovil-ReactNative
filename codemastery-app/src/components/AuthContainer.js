import { ScrollView, StyleSheet } from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { darkColors } from "../theme/darkTheme"
import useResponsive from "../hooks/useResponsive"

const AuthContainer = ({
  children,
  showStatusBar = true,
  statusBarStyle = "light",
  backgroundColor = darkColors.background,
  keyboardShouldPersistTaps = "handled",
  contentContainerStyle,
  ...props
}) => {
  const { utils, spacing, isAndroid } = useResponsive()

  const containerStyle = [styles.container, utils.getSafeStyle("container"), { backgroundColor }]

  const scrollContentStyle = [
    styles.scrollContent,
    {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
    },
    contentContainerStyle,
  ]

  return (
    <>
      {showStatusBar && (
        <StatusBar
          style={statusBarStyle}
          backgroundColor={isAndroid ? backgroundColor : "transparent"}
          translucent={isAndroid}
        />
      )}
      <SafeAreaView style={containerStyle} edges={["top", "bottom", "left", "right"]}>
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          {...props}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
  },
})

export default AuthContainer
