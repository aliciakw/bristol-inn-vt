import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  id: string;
  label: string;
  error?: string;
  className?: string;
}

export function FormField({ id, label, error, className, ...inputProps }: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-serif font-medium text-ink-900 mb-1.5 text-sm">
        {label}
      </label>
      <input id={id} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={error ? true : undefined} {...inputProps} className="w-full bg-white/50 border border-ink-900 rounded-[8px] px-4 py-3 font-serif text-ink-900 appearance-none focus:outline-none focus:ring-1 focus:ring-ink-900 disabled:opacity-50" />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
