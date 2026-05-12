import React from 'react';
import GoogleSvg from '@/assets/images/google-svgrepo-com.svg';
import AppleSvg from '@/assets/images/apple-svgrepo-com.svg';

export function GoogleIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
  return <GoogleSvg width={width} height={height} />;
}

export function AppleIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
  return <AppleSvg width={width} height={height} />;
}
