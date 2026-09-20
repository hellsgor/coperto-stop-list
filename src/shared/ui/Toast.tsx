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
        className="text-background/70 hover:text-background"
      >
        ✕
      </button>
    </div>
  );
}
