import { type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  trailingIcon?: React.ReactNode;
  prefix?: string;
};

export default function AuthInput({
  label,
  type = 'text',
  className,
  trailingIcon,
  prefix,
  ...rest
}: AuthInputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={rest.id ?? rest.name}
          className="text-base font-semibold text-primary"
        >
          {label}
        </label>
      )}

      <div
        className="flex items-center rounded-full border-2 border-primary bg-white
                   focus-within:ring-2 focus-within:ring-primary/30"
      >
        {prefix && (
          <>
            <span className="shrink-0 pl-6 pr-4 text-base font-medium text-primary">
              {prefix}
            </span>
            <span className="self-stretch w-px bg-primary/30" aria-hidden="true" />
          </>
        )}

        <input
          type={actualType}
          className={[
            'min-w-0 flex-1 bg-transparent py-4 text-base text-ink',
            'placeholder:text-ink-soft focus:outline-none',
            prefix ? 'pl-4' : 'pl-6',
            isPassword || trailingIcon ? 'pr-14' : 'pr-6',
            className ?? '',
          ].join(' ')}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="mr-5 shrink-0 text-primary"
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {!isPassword && trailingIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none mr-5 shrink-0 text-primary"
          >
            {trailingIcon}
          </span>
        )}
      </div>
    </div>
  );
}