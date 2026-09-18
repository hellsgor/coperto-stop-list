import { z } from 'zod';
import type { ApiErrorBody, ApiErrorCode } from '@/types/api';

const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'STOCK_EMPTY',
  'SIMULATED_FAILURE',
] as const satisfies readonly ApiErrorCode[];

const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.enum(API_ERROR_CODES),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

const FALLBACK_ERROR_BODY: ApiErrorBody = {
  error: {
    code: 'SIMULATED_FAILURE',
    message: 'Не удалось выполнить запрос. Попробуйте ещё раз.',
  },
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.error.code;
    this.fieldErrors = body.error.fieldErrors;
  }
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  const raw: unknown = await response.json().catch(() => null);
  const result = apiErrorBodySchema.safeParse(raw);
  return result.success ? result.data : FALLBACK_ERROR_BODY;
}

function resolveUrl(input: string): string {
  if (typeof window !== 'undefined' || !input.startsWith('/')) {
    return input;
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined) ??
    'http://localhost:3000';

  return new URL(input, base).toString();
}

export async function http<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(resolveUrl(input), init);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, {
      error: {
        code: 'SIMULATED_FAILURE',
        message: 'Нет связи с сервером. Проверьте соединение.',
      },
    });
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorBody(response));
  }

  return (await response.json()) as T;
}
