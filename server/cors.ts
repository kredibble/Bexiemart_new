/**
 * CORS configuration for BexieMart API server.
 * Centralized list of allowed origins for development and production.
 */
export const ALLOWED_ORIGINS = [
  'http://localhost:8081',    // Expo Metro dev server
  'http://localhost:19000',   // Expo dev tools
  'http://localhost:19006',   // Expo web preview
  'http://localhost:5173',    // Vite web preview
  'http://10.0.2.2:3000',     // Android emulator → host machine
  'http://10.0.2.2:8081',     // Android emulator → host Metro
  'https://bexiemart.com',    // Production web
  'https://app.bexiemart.com', // Production app web
];

export const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, Set-Cookie, x-request-id',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Expose-Headers': 'Set-Cookie',
};
