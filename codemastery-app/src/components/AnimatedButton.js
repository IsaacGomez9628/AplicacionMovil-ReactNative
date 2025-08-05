"use client"

import { useRef } from "react"
import { Animated, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { Button } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import LoadingSpinner from "./LoadingSpinner"
import useResponsive from "../hooks/useResponsive"

const AnimatedButton = ({
  children,
  onPress,
  style,
  mode = "contained",
  disabled = false,
  loading = false,
  icon,
  hapticFeedback = true,
  animationType = "scale",
  shadowType = "shadow",
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current
  const { spacing, utils } = useResponsive()

  const handlePressIn = () => {
    if (disabled || loading) return

    // Haptic feedback
    if (hapticFeedback && Platform.OS === "ios") {
      try {
        const { HapticFeedback } = require("expo-haptics")
        HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light)
      } catch (error) {
        console.log("Haptic feedback not available")
      }
    }

    // Animation based on type
    switch (animationType) {
      case "scale":
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start()
        break
      case "opacity":
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }).start()
        break
      case "both":
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start()
        break
    }
  }

  const handlePressOut = () => {
    if (disabled || loading) return

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  }

  // ✅ SOLUCIÓN: Usar utils.getShadow
  const shadowStyle = utils.getShadow(shadowType)

  const buttonStyle = [
    styles.button,
    shadowStyle, // ✅ Siempre definido
    {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    style,
  ]

  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner size="small" type="dots" />
    }

    if (icon) {
      return <Icon name={icon} size={20} color="#ffffff" />
    }

    return null
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={buttonStyle}
        {...props}
      >
        <Button
          mode={mode}
          disabled={disabled || loading}
          icon={renderIcon}
          style={styles.innerButton}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {children}
        </Button>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: "hidden",
  },
  innerButton: {
    margin: 0,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  buttonLabel: {
    fontWeight: "600",
  },
})

export default AnimatedButton
