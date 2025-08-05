"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Easing } from "react-native"
import { ActivityIndicator, Text } from "react-native-paper"
import LottieView from "lottie-react-native"
import useResponsive from "../hooks/useResponsive"

const LoadingSpinner = ({
  type = "default",
  message = "Cargando...",
  size = "large",
  color = "#6366f1",
  overlay = false,
  lottieSource = null,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const { spacing, fontSize } = useResponsive()

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const containerStyle = [
    overlay ? styles.overlay : styles.container,
    {
      padding: spacing.lg,
    },
  ]

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  }

  const renderSpinner = () => {
    if (lottieSource) {
      return <LottieView source={lottieSource} autoPlay loop style={styles.lottie} />
    }

    switch (type) {
      case "pulse":
        return <PulseLoader color={color} size={size} />
      case "dots":
        return <DotsLoader color={color} />
      default:
        return <ActivityIndicator size={size} color={color} />
    }
  }

  return (
    <View style={containerStyle}>
      <Animated.View style={[styles.content, animatedStyle]}>
        {renderSpinner()}
        {message && (
          <Text
            style={[
              styles.message,
              {
                fontSize: fontSize.md,
                marginTop: spacing.md,
                color: overlay ? "#ffffff" : "#6b7280",
              },
            ]}
          >
            {message}
          </Text>
        )}
      </Animated.View>
    </View>
  )
}

// Custom Pulse Loader
const PulseLoader = ({ color, size }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => pulse())
    }
    pulse()
  }, [])

  const sizeValue = size === "large" ? 60 : size === "small" ? 30 : 45

  return (
    <Animated.View
      style={[
        styles.pulseContainer,
        {
          width: sizeValue,
          height: sizeValue,
          backgroundColor: color,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    />
  )
}

// Custom Dots Loader
const DotsLoader = ({ color }) => {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animateDots = () => {
      const duration = 600
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0, duration, useNativeDriver: true }),
      ]).start(() => animateDots())
    }
    animateDots()
  }, [])

  return (
    <View style={styles.dotsContainer}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              opacity: dot,
              transform: [
                {
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    fontWeight: "500",
  },
  lottie: {
    width: 100,
    height: 100,
  },
  pulseContainer: {
    borderRadius: 30,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
})

export default LoadingSpinner
