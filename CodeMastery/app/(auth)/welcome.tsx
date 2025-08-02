import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "react-native-size-matters";
// o desde donde hayas definido esa función

import Button from "@/components/Button";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper size={0.04}>
      <View style={styles.container}>
        <View>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            style={styles.loginButton}
          >
            <Typo size={16} fontWeight={"500"}>
              Sign in
            </Typo>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeIn.duration(1000)}
            source={require("../../assets/images/CodeMastery_FondoNegro_Sinfondo.png")}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        {/* Footer */}

        <View style={styles.footer}>
          <Animated.View
            entering={FadeIn.duration(1000).springify().damping(12)}
            style={{ alignItems: "center" }}
          >
            <Typo size={20} fontWeight={"800"}>
              CodeMastery
            </Typo>
            <Typo size={20} fontWeight={"800"}>
              of yout learning
            </Typo>
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(1000).delay(100).springify().damping(12)}
            style={{ alignItems: "center", gap: 2 }}
          >
            <Typo size={12} color={colors.textLight}>
              Always take control
            </Typo>
            <Typo size={12} color={colors.textLight}>
              of yout finance
            </Typo>
          </Animated.View>

          <Animated.View
            style={styles.buttonContainer}
            entering={FadeIn.duration(1000).delay(200).springify().damping(12)}
          >
            <Button onPress={() => router.push("/(auth)/register")}>
              <Typo size={15} color={colors.black} fontWeight={"700"}>
                Get started
              </Typo>
            </Button>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacingY._20,
  },
  welcomeImage: {
    width: "100%",
    height: verticalScale(200),
    alignSelf: "center",
    marginTop: verticalScale(94),
  },

  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20,
  },
  footer: {
    backgroundColor: colors.neutral900,
    alignItems: "center",
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20,
    shadowColor: "white",
    shadowOffset: { width: 0, height: -10 },
    elevation: 10,
    shadowRadius: 25,
    shadowOpacity: 0.15,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._25,
  },
});
