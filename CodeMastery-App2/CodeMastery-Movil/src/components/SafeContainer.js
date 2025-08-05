import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import useResponsive from "../hooks/useResponsive"

const SafeContainer = ({
  children,
  style,
  backgroundColor = "#f8fafc",
  statusBarStyle = "auto",
  statusBarBackgroundColor,
  edges = ["top", "bottom", "left", "right"],
  safeAreaType = "container", // container, header, content
}) => {
  const { utils, isAndroid, safeAreaStyles } = useResponsive()

  // ✅ SOLUCIÓN: Usar los estilos seguros del hook
  const safeStyle = utils.getSafeStyle(safeAreaType)

  const containerStyle = [
    styles.container,
    {
      backgroundColor,
      ...safeStyle, // ✅ Aplicar estilos seguros automáticamente
    },
    style,
  ]

  return (
    <>
      <StatusBar
        style={statusBarStyle}
        backgroundColor={statusBarBackgroundColor || (isAndroid ? "#6366f1" : "transparent")}
        translucent={isAndroid}
      />
      <SafeAreaView style={containerStyle} edges={edges}>
        {children}
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default SafeContainer
