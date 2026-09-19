'use client';

import { useSyncExternalStore } from 'react';
import { formatUntil, isStopExpired } from '../lib/format';

type Props = {
  until: string | null;
  now: number;
};

const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// `formatUntil` для действующего (не истёкшего) срока форматирует время в
// часовом поясе окружения, где выполняется код (SPEC §8.6 — пояс браузера).
// На сервере это пояс сервера, поэтому SSR-разметка и первый клиентский
// рендер должны совпадать (иначе — hydration mismatch, и `suppressHydrationWarning`
// тут не спасает: React не патчит текст, просто перестаёт ругаться, оставляя
// неверное время в DOM). Решение — ничего не показывать до гидратации именно
// для той ветки, что зависит от часового пояса, и досчитать сразу после неё.
// `useSyncExternalStore` с разными server/client снапшотами — стандартный
// способ получить это без `setState` в эффекте.
export function UntilLabel({ until, now }: Props) {
  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const isTimeZoneDependent = until !== null && !isStopExpired(until, now);
  if (isTimeZoneDependent && !isHydrated) {
    return null;
  }

  return formatUntil(until, now);
}
