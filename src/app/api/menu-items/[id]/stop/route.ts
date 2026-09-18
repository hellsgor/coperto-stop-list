import { NextRequest } from 'next/server';
import { z } from 'zod';
import { stopItemSchema } from '@/features/stop-list/model/schema';
import {
  applyStop,
  delay,
  getMenuItemById,
  maybeFail,
} from '@/server/menu-store';
import { jsonError, jsonOk } from '@/server/api-response';

export async function POST(
  request: NextRequest,
  { params }: RouteContext<'/api/menu-items/[id]/stop'>,
) {
  const { id } = await params;

  await delay(600);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = undefined;
  }

  const result = stopItemSchema.safeParse(payload);
  if (!result.success) {
    const { fieldErrors, formErrors } = z.flattenError(result.error);
    return jsonError(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: formErrors[0] ?? 'Проверьте поля формы.',
        fieldErrors,
      },
    });
  }

  if (!getMenuItemById(id)) {
    return jsonError(404, {
      error: { code: 'NOT_FOUND', message: 'Позиция не найдена.' },
    });
  }

  if (maybeFail()) {
    return jsonError(500, {
      error: {
        code: 'SIMULATED_FAILURE',
        message: 'Не удалось поставить позицию в стоп. Попробуйте ещё раз.',
      },
    });
  }

  const updated = applyStop(id, result.data);
  if (!updated) {
    return jsonError(404, {
      error: { code: 'NOT_FOUND', message: 'Позиция не найдена.' },
    });
  }

  return jsonOk(updated);
}
