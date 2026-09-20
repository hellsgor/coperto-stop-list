type Props = {
  message: string;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: Props) {
  return (
    <div
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
        ✕
      </button>
    </div>
  );
}
