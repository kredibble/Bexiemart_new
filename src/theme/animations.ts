export const animations = {
  fast: { duration: 150, useNativeDriver: true },
  normal: { duration: 300, useNativeDriver: true },
  slow: { duration: 500, useNativeDriver: true },

  spring: {
    speed: 14,
    bounciness: 6,
    useNativeDriver: true,
  },

  springGentle: {
    speed: 10,
    bounciness: 4,
    useNativeDriver: true,
  },

  springSnap: {
    speed: 20,
    bounciness: 3,
    useNativeDriver: true,
  },
} as const;

export const timingConfigs = {
  fadeIn: { duration: 300, useNativeDriver: true },
  fadeOut: { duration: 200, useNativeDriver: true },
  slideIn: { duration: 300, useNativeDriver: true },
  slideOut: { duration: 200, useNativeDriver: true },
  scaleIn: { duration: 300, useNativeDriver: true },
  scaleOut: { duration: 150, useNativeDriver: true },
} as const;
