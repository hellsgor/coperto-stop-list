'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  REASON_LABELS,
  SHOP_LABELS,
  STATUS_LABELS,
  formatStock,
  isStopExpired,
} from '../lib/format';
import { UntilLabel } from './UntilLabel';
import type { MenuItem } from '@/types/menu';

type Props = {
  items: MenuItem[];
  pendingIds: ReadonlySet<string>;
  // Момент, на который актуальны данные (`dataUpdatedAt` из useQuery) —
  // используется вместо `Date.now()` в render, чтобы не звать нечистую
  // функцию во время рендера (react-hooks/purity) и не замораживать
  // проверку срока на моменте маунта таблицы.
  asOf: number;
  onStop: (item: MenuItem) => void;
  onResume: (item: MenuItem) => void;
};

type ScrollShadowState = {
  isScrollable: boolean;
  atStart: boolean;
  atEnd: boolean;
};

const INITIAL_SCROLL_STATE: ScrollShadowState = {
  isScrollable: false,
  atStart: true,
  atEnd: true,
};

export function StopListTable({
  items,
  pendingIds,
  asOf,
  onStop,
  onResume,
}: Props) {
  // `containerRef` меряет ширину, доступную таблице БЕЗ учёта bleed-отступа
  // ниже (сам bleed вешается на `scrollRef`, а не на этот элемент) —
  // иначе решение «нужен ли bleed» зависело бы от уже применённого bleed
  // и зацикливалось бы (то влезает, то нет на каждый ререндер).
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Натуральную ширину контента меряем прямо на `<table>`, а не на
  // обёртке вокруг неё и не через `scrollRef.scrollWidth`: обёртки
  // переключают классы (`-mx-6`, `w-fit`) в зависимости от `isScrollable`,
  // поэтому их собственный рендер-размер зависит от предыдущего решения
  // и может зациклиться. У `<table>` с `whitespace-nowrap` рендер-ширина
  // всегда равна необходимому минимуму (браузер игнорирует `w-full`,
  // если контент без переноса требует больше места), независимо от того,
  // какой класс на ней сейчас стоит — стабильный источник истины.
  const tableRef = useRef<HTMLTableElement>(null);
  const [scrollState, setScrollState] = useState(INITIAL_SCROLL_STATE);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    const scroller = scrollRef.current;
    const table = tableRef.current;
    if (!container || !scroller || !table) return;
    setScrollState({
      isScrollable: table.offsetWidth > container.clientWidth + 1,
      atStart: scroller.scrollLeft <= 0,
      atEnd:
        scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1,
    });
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateScrollState, items]);

  const { isScrollable, atStart, atEnd } = scrollState;

  return (
    <div ref={containerRef}>
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className={cn(
          'overflow-x-auto',
          // 24px соответствует `p-6` контейнера страницы в
          // `StopListView.tsx` — гутер переезжает внутрь скролла (см.
          // `px-6` ниже), чтобы у истинных краёв скролла было видно
          // чистый отступ, а между ними — обрезанный контент.
          isScrollable && '-mx-6',
          isScrollable && !atStart && 'mask-l-from-85%',
          isScrollable && !atEnd && 'mask-r-from-85%',
        )}
      >
        <div
          className={cn(
            'border-black/10',
            isScrollable
              ? // При bleed рамка доходит до истинных краёв экрана —
                // скруглять там нечего (это уже край экрана, а не
                // карточка на странице), и вертикальные линии слева/
                // справа тоже не нужны. Верхняя/нижняя остаются: они
                // отделяют таблицу от контента над и под ней.
                //
                // `w-fit`: обычный блочный `div` по умолчанию
                // растягивается на ширину родителя, а не на ширину
                // своего содержимого — без этого класса рамка
                // обрезалась бы по видимой области скролла, а `table`
                // внутри просто вылезала бы за неё без видимой границы.
                'w-fit border-y px-6'
              : 'rounded-lg border',
          )}
        >
          <table
            ref={tableRef}
            className={cn(
              'text-left text-sm whitespace-nowrap',
              !isScrollable && 'w-full',
            )}
          >
            <thead>
              <tr className="text-foreground/60 border-b border-black/10 text-xs">
                <th scope="col" className="px-4 py-2 font-medium">
                  Название
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Цех
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Остаток
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Статус
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Действие
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <StopListRow
                  key={item.id}
                  item={item}
                  isPending={pendingIds.has(item.id)}
                  now={asOf}
                  onStop={onStop}
                  onResume={onResume}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type RowProps = {
  item: MenuItem;
  isPending: boolean;
  now: number;
  onStop: (item: MenuItem) => void;
  onResume: (item: MenuItem) => void;
};

function StopListRow({ item, isPending, now, onStop, onResume }: RowProps) {
  const { status } = item;
  const isStopped = status.kind === 'stopped';
  const isOutOfStock = item.stock === 0;

  return (
    <tr
      className={
        isStopped
          ? 'text-foreground/70 border-b border-black/5 bg-black/2 transition-colors duration-300 last:border-b-0 motion-reduce:transition-none'
          : 'border-b border-black/5 transition-colors duration-300 last:border-b-0 motion-reduce:transition-none'
      }
    >
      <td className="px-4 py-3">{item.title}</td>
      <td className="px-4 py-3">{SHOP_LABELS[item.shop]}</td>
      <td className="px-4 py-3 tabular-nums">{formatStock(item.stock)}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {status.kind === 'stopped' ? (
            <Badge
              variant={isStopExpired(status.until, now) ? 'warning' : 'accent'}
            >
              {`${REASON_LABELS[status.reason]} · `}
              <UntilLabel until={status.until} now={now} />
            </Badge>
          ) : (
            STATUS_LABELS.available
          )}
          {isPending && (
            <span className="text-foreground/70 text-xs">Сохраняется…</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {isStopped ? (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={() => onStop(item)}
                data-row-action={item.id}
              >
                Изменить
              </Button>
              <Button
                variant="secondary"
                isLoading={isPending}
                disabled={isPending || isOutOfStock}
                onClick={() => onResume(item)}
              >
                Вернуть в продажу
              </Button>
            </div>
            {isOutOfStock && (
              <span className="text-foreground/70 text-xs">
                Остаток 0 — нельзя вернуть в продажу
              </span>
            )}
          </div>
        ) : (
          <Button
            variant="secondary"
            isLoading={isPending}
            disabled={isPending}
            onClick={() => onStop(item)}
            data-row-action={item.id}
          >
            Поставить в стоп
          </Button>
        )}
      </td>
    </tr>
  );
}
