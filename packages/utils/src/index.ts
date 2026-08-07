import { ApiResponse } from '@chatbot/types';

export function createApiResponse<T>(
  success: boolean,
  message: string,
  data: T | null = null,
  error: any = null,
): ApiResponse<T> {
  return {
    success,
    message,
    data,
    error: error ? { code: error.code || 'ERROR', message: error.message || 'An error occurred', details: error.details } : null,
    timestamp: new Date().toISOString(),
  };
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
