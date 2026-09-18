import { NextRequest } from 'next/server';
import {
  applyResume,
  delay,
  getMenuItemById,
  maybeFail,
} from '@/server/menu-store';
import { jsonError, jsonOk } from '@/server/api-response';

export async function POST(
  _request: NextRequest,
  { params }: RouteContext<'/api/menu-items/[id]/resume'>,
) {
  const { id } = await params;

  await delay(600);

  const current = getMenuItemById(id);
  if (!current) {
    return jsonError(404, {
      error: { code: 'NOT_FOUND', message: 'Позиция не найдена.' },
    });
  }

  // resume для позиции в продаже идемпотентен: менять нечего, поэтому
  // случайный сбой здесь не проверяем (SPEC §4).
  if (current.status.kind === 'available') {
    return jsonOk(current);
  }

  if (current.stock === 0) {
    return jsonError(422, {
      error: {
        code: 'STOCK_EMPTY',
        message: 'Нельзя вернуть в продажу: остаток равен нулю.',
      },
    });
  }

  if (maybeFail()) {
    return jsonError(500, {
      error: {
        code: 'SIMULATED_FAILURE',
        message: 'Не удалось вернуть позицию в продажу. Попробуйте ещё раз.',
      },
    });
  }

  const updated = applyResume(id);
  if (!updated) {
    return jsonError(404, {
      error: { code: 'NOT_FOUND', message: 'Позиция не найдена.' },
    });
  }

  return jsonOk(updated);
}
