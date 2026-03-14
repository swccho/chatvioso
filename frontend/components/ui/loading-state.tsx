import { Spinner } from "./spinner";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-primary-secondary">
      <Spinner size="md" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
