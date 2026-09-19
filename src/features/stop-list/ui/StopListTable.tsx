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

export function StopListTable({
  items,
  pendingIds,
  asOf,
  onStop,
  onResume,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10">
      <table className="w-full min-w-180 text-left text-sm">
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
          ? 'text-foreground/70 border-b border-black/5 bg-black/2 last:border-b-0'
          : 'border-b border-black/5 last:border-b-0'
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
            <Button
              variant="secondary"
              isLoading={isPending}
              disabled={isPending || isOutOfStock}
              onClick={() => onResume(item)}
            >
              Вернуть в продажу
            </Button>
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
          >
            Поставить в стоп
          </Button>
        )}
      </td>
    </tr>
  );
}
