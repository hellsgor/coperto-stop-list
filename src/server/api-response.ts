import { NextResponse } from 'next/server';
import type { ApiErrorBody } from '@/types/api';

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export function jsonError(status: number, body: ApiErrorBody) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
