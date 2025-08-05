import { useState } from "react";
import { View } from "react-native";
import { Text, Divider } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AuthContainer from "../../components/AuthContainer";
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import AuthButton from "../../components/AuthButton";
import ScreenTransition from "../../components/ScreenTransition";
import StatusIndicator from "../../components/StatusIndicator";
import { getAuthStyles } from "../../theme/darkTheme";
import useResponsive from "../../hooks/useResponsive";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email es requerido"),
});

export default function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const responsive = useResponsive();
  const styles = getAuthStyles(responsive);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage("Se ha enviado un enlace de recuperación a tu email");
      setShowSuccess(true);

      // Navegar de vuelta al login después de 3 segundos
      setTimeout(() => {
        navigation.navigate("Login");
      }, 3000);
    } catch (error) {
      setMessage("Error al enviar el email de recuperación");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer statusBarStyle="light-content">
      <ScreenTransition type="slideUp">
        <StatusIndicator
          type="error"
          message={message}
          visible={showError}
          onHide={() => setShowError(false)}
        />

        <StatusIndicator
          type="success"
          message={message}
          visible={showSuccess}
          onHide={() => setShowSuccess(false)}
        />

        <View style={styles.content}>
          <ScreenTransition type="fadeIn" delay={200}>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Icon name="lock-reset" size={64} color="#6366f1" />
            </View>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={400}>
            <Text variant="headlineMedium" style={styles.title}>
              Recuperar Contraseña
            </Text>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={600}>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña
            </Text>
          </ScreenTransition>

          <ScreenTransition type="slideUp" delay={800}>
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

              <AuthButton
                variant="primary"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                icon="email-send"
              >
                {loading ? "Enviando..." : "Enviar Enlace"}
              </AuthButton>
            </AuthCard>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={1000}>
            <Divider style={styles.divider} />

            <AuthButton
              variant="text"
              onPress={() => navigation.navigate("Login")}
              icon="arrow-left"
            >
              Volver al inicio de sesión
            </AuthButton>
          </ScreenTransition>
        </View>
      </ScreenTransition>
    </AuthContainer>
  );
}
