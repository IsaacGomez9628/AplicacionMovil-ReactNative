"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated } from "react-native"
import { Text } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import LottieView from "lottie-react-native"
import useResponsive from "../hooks/useResponsive"

const StatusIndicator = ({
  type = "success", // success, error, warning, info, loading
  message,
  visible = true,
  onHide,
  autoHide = true,
  duration = 3000,
  lottieSource,
  position = "top", // top, center, bottom
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-100)).current
  const { spacing, fontSize } = useResponsive()

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto hide
      if (autoHide) {
        setTimeout(() => {
          hideIndicator()
        }, duration)
      }
    } else {
      hideIndicator()
    }
  }, [visible])

  const hideIndicator = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === "top" ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide()
    })
  }

  const getStatusConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#10b981",
          icon: "check-circle",
          color: "#ffffff",
        }
      case "error":
        return {
          backgroundColor: "#ef4444",
          icon: "close-circle",
          color: "#ffffff",
        }
      case "warning":
        return {
          backgroundColor: "#f59e0b",
          icon: "alert-circle",
          color: "#ffffff",
        }
      case "info":
        return {
          backgroundColor: "#3b82f6",
          icon: "information",
          color: "#ffffff",
        }
      case "loading":
        return {
          backgroundColor: "#6366f1",
          icon: "loading",
          color: "#ffffff",
        }
      default:
        return {
          backgroundColor: "#6b7280",
          icon: "information",
          color: "#ffffff",
        }
    }
  }

  const config = getStatusConfig()

  const containerStyle = [
    styles.container,
    {
      backgroundColor: config.backgroundColor,
      [position]: position === "center" ? "50%" : spacing.lg,
      marginTop: position === "center" ? -25 : 0,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  ]

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      {
        translateY: position === "center" ? 0 : slideAnim,
      },
    ],
  }

  if (!visible && fadeAnim._value === 0) return null

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <View style={styles.content}>
        {lottieSource ? (
          <LottieView source={lottieSource} autoPlay loop={type === "loading"} style={styles.lottie} />
        ) : (
          <Icon name={config.icon} size={24} color={config.color} style={styles.icon} />
        )}
        {message && (
          <Text
            style={[
              styles.message,
              {
                color: config.color,
                fontSize: fontSize.sm,
              },
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontWeight: "500",
  },
  lottie: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
})

export default StatusIndicator
