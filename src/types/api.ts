export type ApiErrorCode =
  'VALIDATION_ERROR' | 'NOT_FOUND' | 'STOCK_EMPTY' | 'SIMULATED_FAILURE';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string; // на русском, готово для показа в тосте
    fieldErrors?: Record<string, string[]>; // только для VALIDATION_ERROR
  };
}
