/**
 * Custom Text component with NativeWind TextClassContext support.
 * Allows parent components (like Button) to pass down text styling via context.
 */
import React, { createContext, useContext } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export const TextClassContext = createContext<string>('');

export interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className = '', style, children, ...props }: TextProps) {
  const contextClassName = useContext(TextClassContext);
  const combinedClassName = [contextClassName, className].filter(Boolean).join(' ');

  return (
    <RNText className={combinedClassName} style={style} {...props}>
      {children}
    </RNText>
  );
}
