"use client"

import { useState } from "react"
import { View, Alert } from "react-native"
import { Text, Divider } from "react-native-paper"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useAuth } from "../../context/AuthContext"
import AuthContainer from "../../components/AuthContainer"
import AuthCard from "../../components/AuthCard"
import AuthInput from "../../components/AuthInput"
import AuthButton from "../../components/AuthButton"
import ScreenTransition from "../../components/ScreenTransition"
import StatusIndicator from "../../components/StatusIndicator"
import { getAuthStyles } from "../../theme/darkTheme"
import useResponsive from "../../hooks/useResponsive"

const schema = yup.object({
  name: yup.string().min(2, "El nombre debe tener al menos 2 caracteres").required("Nombre es requerido"),
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("Contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirmar contraseña es requerido"),
})

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { register } = useAuth()
  const responsive = useResponsive()
  const styles = getAuthStyles(responsive)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setShowError(false)

    try {
      const result = await register(data.name, data.email, data.password)
      if (result.success) {
        Alert.alert("Éxito", "Cuenta creada exitosamente. Ahora puedes iniciar sesión.", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ])
      } else {
        setErrorMessage(result.error)
        setShowError(true)
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error inesperado")
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContainer statusBarStyle="light-content">
      <ScreenTransition type="slideUp">
        <StatusIndicator type="error" message={errorMessage} visible={showError} onHide={() => setShowError(false)} />

        <View style={styles.content}>
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
                disabled={loading}
                icon="account-plus"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </AuthButton>
            </AuthCard>
          </ScreenTransition>

          <ScreenTransition type="fadeIn" delay={800}>
            <Divider style={styles.divider} />

            <AuthButton variant="text" onPress={() => navigation.navigate("Login")}>
              ¿Ya tienes cuenta? Inicia sesión
            </AuthButton>
          </ScreenTransition>
        </View>
      </ScreenTransition>
    </AuthContainer>
  )
}
