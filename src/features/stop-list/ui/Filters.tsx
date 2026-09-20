import { SHOPS, STATUSES } from '../model/schema';
import { SHOP_LABELS, STATUS_LABELS } from '../lib/format';
import type { MenuItemStatus, Shop } from '@/types/menu';

type Props = {
  shop: Shop | undefined;
  status: MenuItemStatus['kind'] | undefined;
  onShopChange: (value: Shop | undefined) => void;
  onStatusChange: (value: MenuItemStatus['kind'] | undefined) => void;
};

export function Filters({ shop, status, onShopChange, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      <FilterGroup
        label="Цех"
        selected={shop}
        onSelect={onShopChange}
        options={SHOPS}
        labels={SHOP_LABELS}
      />
      <FilterGroup
        label="Статус"
        selected={status}
        onSelect={onStatusChange}
        options={STATUSES}
        labels={STATUS_LABELS}
      />
    </div>
  );
}

type FilterGroupProps<T extends string> = {
  label: string;
  selected: T | undefined;
  onSelect: (value: T | undefined) => void;
  options: readonly T[];
  labels: Record<T, string>;
};

function FilterGroup<T extends string>({
  label,
  selected,
  onSelect,
  options,
  labels,
}: FilterGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      <FilterButton
        pressed={selected === undefined}
        onClick={() => onSelect(undefined)}
      >
        Все
      </FilterButton>
      {options.map((value) => (
        <FilterButton
          key={value}
          pressed={selected === value}
          onClick={() => onSelect(value)}
        >
          {labels[value]}
        </FilterButton>
      ))}
    </div>
  );
}

type FilterButtonProps = {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function FilterButton({ pressed, onClick, children }: FilterButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? 'bg-accent hover:bg-accent/90 active:bg-accent/80 focus-visible:ring-accent focus-visible:ring-offset-background cursor-pointer rounded-full px-3 py-1.5 text-sm text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
          : 'text-foreground focus-visible:ring-accent focus-visible:ring-offset-background cursor-pointer rounded-full border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-black/10'
      }
    >
      {children}
    </button>
  );
}
