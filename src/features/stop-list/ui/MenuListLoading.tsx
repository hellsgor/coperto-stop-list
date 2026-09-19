import { Spinner } from '@/shared/ui/Spinner';

export function MenuListLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
      <Spinner className="h-6 w-6" />
      <p className="text-foreground/70 text-sm">Загружаем меню…</p>
    </div>
  );
}
