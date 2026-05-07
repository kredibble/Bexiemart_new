import React from "react";
import { TextInput, type TextInputProps } from "react-native";

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      style={[
        {
          minHeight: 48,
          borderWidth: 1,
          borderColor: "#E4E7EC",
          borderRadius: 12,
          paddingHorizontal: 14,
          backgroundColor: "#FFFFFF",
          color: "#111322",
        },
        style,
      ]}
      placeholderTextColor="#98A2B3"
      {...props}
    />
  );
}
