import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  label?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'light';
}

export function LoadingSpinner({
  size = 'large',
  color = '#004CFF',
  label,
  fullScreen = false,
  variant = 'default',
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4"
        style={{ backgroundColor: variant === 'light' ? '#F8F9FA' : '#FFFFFF' }}
      >
        <ActivityIndicator size={size} color={color} />
        {label && (
          <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5F6C7B' }}>
            {label}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8 gap-2">
      <ActivityIndicator size={size} color={color} />
      {label && (
        <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#5F6C7B' }}>
          {label}
        </Text>
      )}
    </View>
  );
}
