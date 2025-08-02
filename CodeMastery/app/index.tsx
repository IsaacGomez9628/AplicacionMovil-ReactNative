import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import LoaderAnimation from "../assets/lotties/Loader Animation using box.json";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true); // Para controlar si se muestra el splash
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false); // Oculta splash después de 4 segundos
      router.push("/(auth)/welcome");
    }, 2000); // Duración en milisegundos

    return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <LottieView
          source={LoaderAnimation}
          autoPlay
          loop={false} // Si quieres que se repita, pon true
          resizeMode="contain"
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={require("../assets/images/Logo_CM_Blanco_Sinfondo.png")}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.neutral900,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral900,
  },
  logo: {
    height: "10%",
    aspectRatio: 1,
  },
});
