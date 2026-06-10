import type { InputHTMLAttributes } from 'react';
import { TextStyle } from './TextStyle';

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
        <TextStyle variant="label" element="span" className="font-medium">
          {label}
        </TextStyle>
      </label>
      <input id={id} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={error ? true : undefined} {...inputProps} className="w-full bg-white/50 border border-ink-900 rounded-[8px] px-4 py-3 font-serif text-ink-900 appearance-none focus:outline-none focus:ring-1 focus:ring-ink-900 disabled:opacity-50" />
      {error && (
        <div className="mt-2">
          <span id={`${id}-error`} className="inline-error">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
