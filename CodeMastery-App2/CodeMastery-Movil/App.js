// ✅ ARCHIVO CORREGIDO: App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LogBox, Platform } from "react-native";

// ✅ IMPORTACIONES CORREGIDAS
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { darkTheme } from "./src/theme/darkTheme";

// ✅ NUEVO: Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
    mutations: {
      retry: 1,
    },
  },
});

// ✅ Ignorar warnings específicos en desarrollo
if (__DEV__) {
  LogBox.ignoreLogs([
    "Warning: Cannot update a component",
    "Warning: componentWillReceiveProps has been renamed",
    "Require cycle:",
    "Remote debugger",
  ]);
}

export default function App() {
  console.log("🚀 App starting...");

  return (
    <SafeAreaProvider>
      <PaperProvider theme={darkTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#1f2937" />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// ✅ NUEVO: Error Boundary para debugging
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <PaperProvider>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
              >
                Algo salió mal 😔
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 20 }}>
                {this.state.error?.message || "Error desconocido"}
              </Text>
              <Button
                mode="contained"
                onPress={() => this.setState({ hasError: false, error: null })}
              >
                Reintentar
              </Button>
            </View>
          </PaperProvider>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}
