import { AlertCircleIcon } from "@/components/ui/icons";

/** The message under an invalid field; `id` is what the input's `aria-describedby` points at. */
export function FieldError({ id, children }: { id: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <span id={id} className="field-error">
      <AlertCircleIcon />
      <span>{children}</span>
    </span>
  );
}
