import type { ReactNode } from 'react';
import { TextStyle } from './TextStyle.tsx';

interface Props {
  name: string;
  label: string;
  id?: string;
  clarification?: ReactNode;
  error?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function FormCheckbox({ name, label, id, clarification, error, checked, onChange, disabled }: Props) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <span className="relative flex-none">
          <input id={id} name={name} type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} disabled={disabled} aria-describedby={error && id ? `${id}-error` : undefined} aria-invalid={error ? true : undefined} />
          <span className="block size-[32px] bg-white/50 border border-ink-900 rounded-[8px]" />
          <svg className="absolute inset-0 m-auto size-5 text-ink-900 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="2,8 6,12 14,4" />
          </svg>
        </span>
        <span className="flex flex-col gap-0.5 pt-2">
          <TextStyle variant="label" element="span" className="font-medium">
            {label}
          </TextStyle>
          {clarification && (
            <TextStyle variant="caption" element="span">
              {clarification}
            </TextStyle>
          )}
        </span>
      </label>
      {error && (
        <div className="mt-2">
          <span id={id ? `${id}-error` : undefined} className="inline-error">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
