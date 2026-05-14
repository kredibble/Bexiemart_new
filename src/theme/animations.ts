export const animations = {
  fast: { duration: 150, useNativeDriver: true },
  normal: { duration: 250, useNativeDriver: true },
  slow: { duration: 400, useNativeDriver: true },

  spring: {
    damping: 20,
    stiffness: 200,
    mass: 1,
    useNativeDriver: true,
  },
  springGentle: {
    damping: 26,
    stiffness: 150,
    mass: 1,
    useNativeDriver: true,
  },
  springBouncy: {
    damping: 14,
    stiffness: 180,
    mass: 1,
    useNativeDriver: true,
  },
} as const;

export const timingConfigs = {
  fadeIn: { duration: 250, useNativeDriver: true },
  fadeOut: { duration: 150, useNativeDriver: true },
  slideIn: { duration: 250, useNativeDriver: true },
  slideOut: { duration: 150, useNativeDriver: true },
  scaleIn: { duration: 250, useNativeDriver: true },
  scaleOut: { duration: 100, useNativeDriver: true },
} as const;
