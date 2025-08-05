"use client"

import { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"

const ScreenTransition = ({ children, type = "fadeIn", duration = 300, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    const animations = []

    switch (type) {
      case "fadeIn":
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        )
        break

      case "slideUp":
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            delay,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
        )
        break

      case "scaleIn":
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            delay,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        )
        break

      case "slideInLeft":
        slideAnim.setValue(-50)
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            delay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        )
        break
    }

    Animated.parallel(animations).start()
  }, [type, duration, delay])

  const getAnimatedStyle = () => {
    switch (type) {
      case "fadeIn":
        return { opacity: fadeAnim }

      case "slideUp":
        return {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }

      case "scaleIn":
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }

      case "slideInLeft":
        return {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }

      default:
        return { opacity: fadeAnim }
    }
  }

  return <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>{children}</Animated.View>
}

export default ScreenTransition
