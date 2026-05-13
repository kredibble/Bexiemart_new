import { setResponseStatus } from 'h3';

interface ApiMeta {
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function success<T>(data: T, meta?: ApiMeta) {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function created<T>(data: T) {
  return {
    success: true,
    data,
  };
}

export function paginated<T>(data: T[], meta: ApiMeta) {
  return {
    success: true,
    data,
    meta,
  };
}

export function error(event: { setResponseStatus: typeof setResponseStatus }, statusCode: number, message: string) {
  setResponseStatus(event as any, statusCode);
  return {
    success: false,
    error: message,
  };
}
