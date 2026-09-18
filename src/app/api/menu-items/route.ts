import { NextRequest } from 'next/server';
import type { ApiErrorBody } from '@/types/api';
import { delay, getMenuItems } from '@/server/menu-store';
import { jsonError, jsonOk } from '@/server/api-response';

export async function GET(request: NextRequest) {
  await delay(800);

  if (request.nextUrl.searchParams.get('debug') === 'fail') {
    const body: ApiErrorBody = {
      error: {
        code: 'SIMULATED_FAILURE',
        message: 'Не удалось загрузить меню. Попробуйте ещё раз.',
      },
    };
    return jsonError(500, body);
  }

  return jsonOk(getMenuItems());
}
