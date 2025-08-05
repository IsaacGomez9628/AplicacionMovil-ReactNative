import { View, StyleSheet } from "react-native"
import SafeContainer from "../components/SafeContainer"
import LoadingSpinner from "../components/LoadingSpinner"
import ScreenTransition from "../components/ScreenTransition"

export default function LoadingScreen({ message = "Cargando..." }) {
  return (
    <SafeContainer>
      <ScreenTransition type="fadeIn">
        <View style={styles.container}>
          <LoadingSpinner type="pulse" message={message} size="large" color="#6366f1" />
        </View>
      </ScreenTransition>
    </SafeContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
