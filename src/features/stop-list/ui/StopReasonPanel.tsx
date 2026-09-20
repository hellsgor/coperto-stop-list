'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useIsPresent } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Select';
import { REASON_LABELS } from '../lib/format';
import { isoToLocalInput, localInputToIso } from '../lib/until-input';
import { STOP_REASONS, stopItemSchema } from '../model/schema';
import { useStopItem } from '../model/use-stop-item';
import type { MenuItem, StopItemPayload, StopReason } from '@/types/menu';
import type { FieldErrors, Resolver } from 'react-hook-form';

type StopFormValues = {
  reason: StopReason | '';
  until: string | null;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const REASON_OPTIONS = STOP_REASONS.map((value) => ({
  value,
  label: REASON_LABELS[value],
}));

// Одна и та же `stopItemSchema` валидирует и здесь, и в route handler'е.
// Резолвер написан вручную (а не zodResolver), потому что тип формы шире
// схемы: `reason` до выбора пользователем — пустая строка, а не валидный
// StopReason, и именно на этот случай в схеме уже есть сообщение
// «Укажите причину».
const resolver: Resolver<StopFormValues, unknown, StopItemPayload> = (
  values,
) => {
  const result = stopItemSchema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors: FieldErrors<StopFormValues> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key === 'reason' || key === 'until') {
      errors[key] = { type: 'validation', message: issue.message };
    }
  }
  return { values: {}, errors };
};

type Props = {
  item: MenuItem;
  onClose: () => void;
};

export function StopReasonPanel({ item, onClose }: Props) {
  // Снимок начального состояния берём один раз при монтировании: `item`
  // приходит из кэша и меняется на лету при оптимистичном апдейте той же
  // мутации, которую эта панель и запускает — без фиксации в момент
  // открытия заголовок и текст кнопки мигали бы между «Поставить в стоп»
  // и «Изменить» на время запроса.
  const [initial] = useState(() => ({
    isEditing: item.status.kind === 'stopped',
    reason: (item.status.kind === 'stopped' ? item.status.reason : '') as
      StopReason | '',
    until: item.status.kind === 'stopped' ? item.status.until : null,
  }));

  const [untilMode, setUntilMode] = useState<'shift_end' | 'custom'>(
    initial.until === null ? 'shift_end' : 'custom',
  );
  const [untilLocalValue, setUntilLocalValue] = useState(
    initial.until === null ? '' : isoToLocalInput(initial.until),
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StopFormValues, unknown, StopItemPayload>({
    resolver,
    mode: 'onBlur',
    defaultValues: { reason: initial.reason, until: initial.until },
  });

  const stopMutation = useStopItem();
  const panelRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();
  const isPresentRef = useRef(isPresent);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  // Оживление той же панели (тот же `key`) до конца её exit-анимации: тогда
  // `isPresent` вернётся в `true`, а основной эффект ниже не перезапустится
  // (его deps не изменились) — нужно самим вернуть фокус в диалог.
  const wasExitingRef = useRef(false);

  useEffect(() => {
    isPresentRef.current = isPresent;
  }, [isPresent]);

  // Как только начинается exit-анимация (панель ещё в DOM, но уже не
  // `isPresent`), сразу возвращаем фокус на кнопку строки, не дожидаясь
  // отложенного unmount по завершении анимации (~200мс).
  useEffect(() => {
    if (!isPresent) {
      wasExitingRef.current = true;
      const panel = panelRef.current;
      const active = document.activeElement;
      const focusStillInPanel =
        active === null ||
        active === document.body ||
        (active instanceof HTMLElement && panel?.contains(active) === true);
      // Пока панель исчезает, пользователь мог успеть перевести фокус
      // на другую строку (например, открыть другую панель) — в этом
      // случае не отбираем фокус обратно.
      if (!focusStillInPanel) return;

      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      } else {
        document
          .querySelector<HTMLElement>(`[data-row-action="${item.id}"]`)
          ?.focus();
      }
      return;
    }

    if (wasExitingRef.current) {
      wasExitingRef.current = false;
      panelRef.current?.focus();
    }
  }, [isPresent, item.id]);

  useEffect(() => {
    const panel = panelRef.current;
    const active = document.activeElement;
    // В dev React StrictMode этот эффект вызывается дважды: на втором
    // проходе фокус уже внутри самой панели (после `panel.focus()` из
    // первого прохода), и запоминать его как «фокус до открытия» нельзя —
    // иначе при закрытии фокус вернулся бы не на кнопку строки, а на уже
    // размонтированную панель.
    if (active instanceof HTMLElement && !panel?.contains(active)) {
      previouslyFocusedRef.current = active;
    }
    // Фокусируем сам контейнер диалога, а не первое поле формы: в dev
    // React StrictMode дважды вызывает этот эффект, и фокус на `<select>`
    // с последующим немедленным blur (при повторном вызове) уже успевал
    // провалидировать ещё не тронутое поле «Причина» под `mode: 'onBlur'`.
    panel?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (!isPresentRef.current) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      const active = document.activeElement;
      const activeIndex =
        active instanceof HTMLElement ? focusable.indexOf(active) : -1;

      // Индекс, а не сравнение с first/last: активный элемент может быть
      // вне панели (фокус на контейнере при монтировании — сам контейнер
      // не входит в `focusable`), либо быть тем же DOM-узлом, что только
      // что стал `disabled` (кнопка сабмита во время pending) и потому
      // выпал из списка, оставаясь при этом `document.activeElement` —
      // в обоих случаях `indexOf` вернёт -1, и это надёжнее, чем ловить
      // каждый такой случай сравнением по ссылке.
      if (activeIndex === -1) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && activeIndex === 0) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeIndex === focusable.length - 1) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    // Возврат фокуса при закрытии выполняет отдельный эффект по переходу
    // `isPresent -> false` (см. выше) — он срабатывает сразу, как только
    // начинается exit-анимация, а не здесь: `AnimatePresence` откладывает
    // реальный unmount (и, соответственно, вызов этого cleanup) до конца
    // анимации (~200мс), и повторный `.focus()` здесь перебивал бы фокус,
    // который пользователь мог успеть перевести куда-то ещё за это время.
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, item.id]);

  const onSubmit = (payload: StopItemPayload) => {
    stopMutation.mutate(
      { id: item.id, payload },
      { onSettled: () => onClose() },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      onClick={isPresent ? onClose : undefined}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-reason-panel-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-background flex w-full max-w-md flex-col gap-4 rounded-lg p-6 shadow-xl outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="stop-reason-panel-title" className="text-lg font-semibold">
          {initial.isEditing ? 'Изменить стоп' : 'Поставить в стоп'}:{' '}
          {item.title}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            {...register('reason')}
            label="Причина"
            placeholder="Выберите причину"
            options={REASON_OPTIONS}
            error={errors.reason?.message}
          />
          <div className="flex flex-col gap-2">
            <span className="text-foreground text-sm font-medium">Срок</span>
            <div
              role="radiogroup"
              aria-label="Срок стопа"
              className="flex gap-4"
            >
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="until-mode"
                  className="focus-visible:ring-accent focus-visible:ring-offset-background rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  checked={untilMode === 'shift_end'}
                  onChange={() => {
                    setUntilMode('shift_end');
                    setValue('until', null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
                До конца смены
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="until-mode"
                  className="focus-visible:ring-accent focus-visible:ring-offset-background rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  checked={untilMode === 'custom'}
                  onChange={() => {
                    setUntilMode('custom');
                    // Пока пользователь ничего не ввёл в поле времени,
                    // не гоняем валидацию — иначе «Некорректное время»
                    // всплывает сразу после переключения режима, до
                    // того, как пользователь вообще притронулся к полю.
                    if (untilLocalValue) {
                      setValue('until', localInputToIso(untilLocalValue), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    } else {
                      setValue('until', '', { shouldDirty: true });
                    }
                  }}
                />
                Указать время
              </label>
            </div>
            {untilMode === 'custom' && (
              <div className="flex flex-col gap-1">
                <label htmlFor="until-input" className="sr-only">
                  Время окончания стопа
                </label>
                <input
                  id="until-input"
                  type="datetime-local"
                  step={900}
                  value={untilLocalValue}
                  aria-invalid={Boolean(errors.until)}
                  aria-describedby={
                    errors.until ? 'until-input-error' : undefined
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setUntilLocalValue(value);
                    setValue('until', value ? localInputToIso(value) : '', {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  className="focus-visible:ring-accent rounded-md border border-black/10 px-3 py-1.5 text-sm hover:border-black/20 focus-visible:ring-2 focus-visible:outline-none"
                />
                {errors.until && (
                  <p id="until-input-error" className="text-accent text-xs">
                    {errors.until.message}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" isLoading={stopMutation.isPending}>
              {initial.isEditing ? 'Сохранить' : 'Поставить в стоп'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
