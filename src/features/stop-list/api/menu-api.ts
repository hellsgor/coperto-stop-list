import { http } from '@/shared/api/http';
import type { MenuItem, StopItemPayload } from '@/types/menu';

export function fetchMenuItems(signal?: AbortSignal): Promise<MenuItem[]> {
  return http<MenuItem[]>('/api/menu-items', { signal });
}

export function stopMenuItem(
  id: string,
  payload: StopItemPayload,
): Promise<MenuItem> {
  return http<MenuItem>(`/api/menu-items/${id}/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function resumeMenuItem(id: string): Promise<MenuItem> {
  return http<MenuItem>(`/api/menu-items/${id}/resume`, { method: 'POST' });
}
