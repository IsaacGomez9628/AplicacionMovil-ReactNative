import { StyleSheet } from "react-native"
import { TextInput, Text } from "react-native-paper"
import { darkColors } from "../theme/darkTheme"
import useResponsive from "../hooks/useResponsive"

const AuthInput = ({ error, errorMessage, style, contentStyle, ...props }) => {
  const { utils } = useResponsive()

  const inputStyle = [
    styles.input,
    {
      backgroundColor: darkColors.inputBackground,
      marginBottom: utils.getSpacing("sm"),
    },
    style,
  ]

  const inputContentStyle = [
    styles.inputContent,
    {
      color: darkColors.onSurface,
    },
    contentStyle,
  ]

  return (
    <>
      <TextInput
        mode="outlined"
        error={error}
        style={inputStyle}
        contentStyle={inputContentStyle}
        outlineColor={darkColors.outline}
        activeOutlineColor={darkColors.primary}
        textColor={darkColors.onSurface}
        placeholderTextColor={darkColors.textTertiary}
        theme={{
          colors: {
            onSurfaceVariant: darkColors.textSecondary,
            outline: darkColors.outline,
            primary: darkColors.primary,
          },
        }}
        {...props}
      />
      {error && errorMessage && (
        <Text
          style={[
            styles.errorText,
            {
              fontSize: utils.getFontSize("xs"),
              marginBottom: utils.getSpacing("sm"),
            },
          ]}
        >
          {errorMessage}
        </Text>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
  },
  inputContent: {
    fontSize: 16,
  },
  errorText: {
    color: darkColors.error,
    marginTop: -8,
  },
})

export default AuthInput
