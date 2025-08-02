import { colors } from "@/constants/theme";
import { InputProps } from "@/types";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const Input = (props: InputProps) => {
  return (
    <View
      style={[styles.container, props.containerStyle && props.containerStyle]}
    >
      <TextInput
        style={[styles.input, props.inputStyle && props.containerStyle]}
        placeholderTextColor={colors.neutral400}
        ref={props.inputRef && props.inputRef}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  input: {},
});
