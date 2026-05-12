/**
 * API Client — Axios instance for unauthenticated requests.
 *
 * All authenticated API calls go through Better Auth's authClient
 * (which manages cookies via the expoClient plugin automatically).
 * This Axios client is only for public/unauthenticated endpoints.
 */
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
