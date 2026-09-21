import { motion } from 'motion/react';
import type { Ref } from 'react';

type Props = {
  message: string;
  onDismiss: () => void;
  ref?: Ref<HTMLDivElement>;
};

export function Toast({ message, onDismiss, ref }: Props) {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      role="status"
      className="bg-foreground text-background flex items-center gap-3 rounded-md px-4 py-3 text-sm shadow-lg"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Закрыть уведомление"
        className="text-background/70 hover:text-background active:text-background/50 focus-visible:ring-background focus-visible:ring-offset-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        ×
      </button>
    </motion.div>
  );
}
