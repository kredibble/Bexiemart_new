/**
 * Better Auth Client Configuration
 *
 * This file creates the Better Auth React client with:
 * - Expo plugin for deep linking + OAuth browser sessions
 * - SecureStore for persistent session cookies
 */
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081",
  plugins: [
    expoClient({
      scheme: "bexiemartnew",
      storagePrefix: "bexiemart",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, useSession, signOut, updateUser } = authClient;
