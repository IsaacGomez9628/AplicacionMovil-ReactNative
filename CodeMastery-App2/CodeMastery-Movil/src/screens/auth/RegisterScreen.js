// ✅ MEJORA PARA: src/screens/auth/RegisterScreen.js
// Agregar validación de email para evitar typos

import { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { Text, Divider, Button as PaperButton } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../context/AuthContext";
import AuthContainer from "../../components/AuthContainer";
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import AuthButton from "../../components/AuthButton";
import ScreenTransition from "../../components/ScreenTransition";
import StatusIndicator from "../../components/StatusIndicator";
import { getAuthStyles } from "../../theme/darkTheme";
import useResponsive from "../../hooks/useResponsive";
import { testConnection, testRegisterEndpoint } from "../../services/api";

// ✅ VALIDACIÓN DE EMAIL MEJORADA
const schema = yup.object({
  name: yup
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .required("Nombre es requerido"),
  email: yup
    .string()
    .email("Email inválido")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mx|es)$/,
      "Email debe tener una extensión válida (.com, .org, .net, etc.)"
    )
    .required("Email es requerido"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirmar contraseña es requerido"),
});

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("unknown");
  const { register } = useAuth();
  const responsive = useResponsive();
  const styles = getAuthStyles(responsive);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ✅ WATCH EMAIL PARA VALIDACIÓN EN TIEMPO REAL
  const watchedEmail = watch("email");

  // ✅ VALIDADOR DE EMAIL CON SUGERENCIAS
  const validateEmailFormat = (email) => {
    if (!email) return null;

    const commonTypos = {
      "gmail.con": "gmail.com",
      "gmail.co": "gmail.com",
      "yahoo.con": "yahoo.com",
      "yahoo.co": "yahoo.com",
      "hotmail.con": "hotmail.com",
      "hotmail.co": "hotmail.com",
      "outlook.con": "outlook.com",
      "outlook.co": "outlook.com",
    };

    const domain = email.split("@")[1];
    if (domain && commonTypos[domain]) {
      return {
        isTypo: true,
        suggestion: email.replace(domain, commonTypos[domain]),
      };
    }

    return { isTypo: false, suggestion: null };
  };

  // Verificar conexión al montar el componente
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    console.log("🔍 Checking connection...");
    const result = await testConnection();

    if (result.success) {
      console.log("✅ Connection OK");
      setConnectionStatus("connected");
    } else {
      console.log("❌ Connection Failed");
      setConnectionStatus("disconnected");
      Alert.alert(
        "Problema de Conexión",
        "No se puede conectar al servidor. Verifica que:\n\n1. El servidor esté corriendo (npm run api)\n2. La IP en api.js sea correcta\n3. Tu dispositivo esté en la misma red"
      );
    }
  };

  const testDirectRegister = async () => {
    console.log("🧪 Testing direct register...");
    setLoading(true);

    const result = await testRegisterEndpoint();

    if (result.success) {
      Alert.alert(
        "✅ Test Exitoso",
        "El endpoint de registro funciona correctamente"
      );
    } else {
      Alert.alert("❌ Test Fallido", result.error);
    }

    setLoading(false);
  };

  const onSubmit = async (data) => {
    console.log("📝 Form submitted:", {
      ...data,
      password: "***",
      confirmPassword: "***",
    });

    // ✅ VALIDAR EMAIL ANTES DE ENVIAR
    const emailValidation = validateEmailFormat(data.email);
    if (emailValidation.isTypo) {
      Alert.alert(
        "⚠️ Posible Error en Email",
        `¿Quisiste decir "${emailValidation.suggestion}"?\n\nEmail actual: ${data.email}`,
        [
          { text: "No, usar como está", style: "cancel" },
          {
            text: "Sí, corregir",
            onPress: () => {
              // Aquí podrías actualizar el formulario, pero por simplicidad
              // le pedimos al usuario que lo corrija manualmente
              Alert.alert(
                "Corrección Sugerida",
                `Por favor cambia tu email a: ${emailValidation.suggestion}`
              );
            },
          },
        ]
      );
      return;
    }

    setLoading(true);
    setShowError(false);

    try {
      console.log("Calling register service...");
      const result = await register(data.name, data.email, data.password);

      console.log("Register result:", result);

      if (result.success) {
        Alert.alert(
          "✅ Éxito",
          "Cuenta creada exitosamente. Ahora puedes iniciar sesión.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        console.log("Register failed:", result.error);
        setErrorMessage(result.error);
        setShowError(true);
      }
    } catch (error) {
      console.error("Register error:", error);
      setErrorMessage(error.message || "Ocurrió un error inesperado");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer statusBarStyle="light-content">
      <ScreenTransition type="slideUp">
        <View style={styles.content}>
          {/* Indicador de conexión */}

          <ScreenTransition type="fadeIn" delay={200}>
            <Text variant="headlineMedium" style={styles.title}>
              Crear Cuenta
            </Text>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={400}>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Únete a nuestra plataforma de aprendizaje
            </Text>
          </ScreenTransition>

          <ScreenTransition type="slideUp" delay={600}>
            <AuthCard>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Nombre completo"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.name}
                    errorMessage={errors.name?.message}
                    autoComplete="name"
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Email"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      // Validación en tiempo real para sugerencias
                      if (text && text.includes("@")) {
                        const validation = validateEmailFormat(text);
                        if (validation.isTypo) {
                          console.log(
                            `💡 Email suggestion: ${validation.suggestion}`
                          );
                        }
                      }
                    }}
                    error={!!errors.email}
                    errorMessage={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                  />
                )}
              />

              {/* ✅ MOSTRAR SUGERENCIA DE EMAIL SI HAY TYPO */}
              {watchedEmail &&
                (() => {
                  const validation = validateEmailFormat(watchedEmail);
                  return validation.isTypo ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#f59e0b",
                        marginTop: -8,
                        marginBottom: 8,
                      }}
                    >
                      💡 ¿Quisiste decir: {validation.suggestion}?
                    </Text>
                  ) : null;
                })()}

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Contraseña"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.password}
                    errorMessage={errors.password?.message}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Confirmar contraseña"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword?.message}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                )}
              />

              <AuthButton
                variant="primary"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading || connectionStatus === "disconnected"}
                icon="account-plus"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </AuthButton>
            </AuthCard>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={800}>
            <Divider style={styles.divider} />

            <AuthButton
              variant="text"
              onPress={() => navigation.navigate("Login")}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </AuthButton>
          </ScreenTransition>
        </View>
      </ScreenTransition>
    </AuthContainer>
  );
}
