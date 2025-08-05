"use client"

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useTheme } from "react-native-paper"
import { Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import useResponsive from "../hooks/useResponsive"

// Screens
import CoursesScreen from "../screens/courses/CoursesScreen"
import CourseDetailScreen from "../screens/courses/CourseDetailScreen"
import ModulesScreen from "../screens/modules/ModulesScreen"
import ModuleDetailScreen from "../screens/modules/ModuleDetailScreen"
import LessonsScreen from "../screens/lessons/LessonsScreen"
import LessonDetailScreen from "../screens/lessons/LessonDetailScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"
import ProgressScreen from "../screens/progress/ProgressScreen"
import UsersScreen from "../screens/users/UsersScreen"
import AttemptsHistoryScreen from "../screens/attempts/AttemptsHistoryScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function CoursesStack() {
  const { spacing } = useResponsive()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6366f1",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: "#f8fafc" },
      }}
    >
      <Stack.Screen name="CoursesList" component={CoursesScreen} options={{ title: "Cursos" }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: "Detalle del Curso" }} />
      <Stack.Screen name="Modules" component={ModulesScreen} options={{ title: "Módulos" }} />
      <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} options={{ title: "Detalle del Módulo" }} />
      <Stack.Screen name="Lessons" component={LessonsScreen} options={{ title: "Lecciones" }} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} options={{ title: "Lección" }} />
    </Stack.Navigator>
  )
}

function ProgressStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6366f1",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        cardStyle: { backgroundColor: "#f8fafc" },
      }}
    >
      <Stack.Screen name="ProgressMain" component={ProgressScreen} options={{ title: "Mi Progreso" }} />
    </Stack.Navigator>
  )
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6366f1",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: "#f8fafc" },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Perfil" }} />
      <Stack.Screen name="Users" component={UsersScreen} options={{ title: "Usuarios" }} />
      <Stack.Screen
        name="AttemptsHistory"
        component={AttemptsHistoryScreen}
        options={{ title: "Historial de Intentos" }}
      />
    </Stack.Navigator>
  )
}

export default function MainNavigator() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { spacing, isTablet } = useResponsive()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Courses") {
            iconName = focused ? "book-open" : "book-open-outline"
          } else if (route.name === "Progress") {
            iconName = focused ? "chart-line" : "chart-line-variant"
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline"
          }

          return <Icon name={iconName} size={isTablet ? 28 : size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : spacing.sm,
          paddingTop: spacing.sm,
          height: Platform.OS === "ios" ? 80 + insets.bottom : 60,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 14 : 12,
          fontWeight: "500",
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
        },
      })}
    >
      <Tab.Screen name="Courses" component={CoursesStack} options={{ title: "Cursos" }} />
      <Tab.Screen name="Progress" component={ProgressStack} options={{ title: "Progreso" }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  )
}
