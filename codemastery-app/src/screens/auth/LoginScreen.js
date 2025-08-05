import { useState } from "react";
import { View } from "react-native";
import { Text, Divider } from "react-native-paper";
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
import { darkColors } from "../../theme/darkTheme";
import useResponsive from "../../hooks/useResponsive";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
});

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const { spacing, utils, isTablet } = useResponsive();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setShowError(false);

    try {
      const result = await login(data.email, data.password);
      if (!result.success) {
        setErrorMessage(result.error);
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error inesperado");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    content: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      maxWidth: isTablet ? 400 : "100%",
    },
    title: {
      color: darkColors.onBackground,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: utils.getFontSize(isTablet ? "xxl" : "xl"),
      marginBottom: utils.getSpacing("sm"),
    },
    subtitle: {
      color: darkColors.textSecondary,
      textAlign: "center",
      opacity: 0.9,
      fontSize: utils.getFontSize("md"),
      marginBottom: utils.getSpacing("xl"),
    },
    divider: {
      backgroundColor: darkColors.outline,
      marginVertical: utils.getSpacing("lg"),
    },
  };

  return (
    <AuthContainer statusBarStyle="light">
      <ScreenTransition type="slideUp">
        <StatusIndicator
          type="error"
          message={errorMessage}
          visible={showError}
          onHide={() => setShowError(false)}
        />

        <View style={styles.content}>
          <ScreenTransition type="fadeIn" delay={200}>
            <Text variant="headlineMedium" style={styles.title}>
              Iniciar Sesión
            </Text>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={400}>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Bienvenido de vuelta
            </Text>
          </ScreenTransition>

          <ScreenTransition type="slideUp" delay={600}>
            <AuthCard>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Email"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.email}
                    errorMessage={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                )}
              />

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
                    autoComplete="password"
                  />
                )}
              />

              <AuthButton
                variant="primary"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                icon="login"
              >
                {loading ? "Iniciando..." : "Iniciar Sesión"}
              </AuthButton>
            </AuthCard>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={800}>
            <Divider style={styles.divider} />

            <AuthButton
              variant="text"
              onPress={() => navigation.navigate("Register")}
            >
              ¿No tienes cuenta? Regístrate
            </AuthButton>
          </ScreenTransition>
        </View>
      </ScreenTransition>
    </AuthContainer>
  );
}
