import { type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  type?: 'text' | 'email' | 'password'|'tel';
  trailingIcon?: React.ReactNode;
};

export default function AuthInput({
  label,
  type = 'text',
  className,
  trailingIcon,
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
      <div className="relative">
        <input
          type={actualType}
          className={
            'w-full rounded-full border-2 border-primary bg-white px-6 py-4 text-base text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
            (isPassword || trailingIcon ? 'pr-14' : '') +
            (className ?? '')
          }
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-primary"
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        {!isPassword && trailingIcon && (
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-primary">
            {trailingIcon}
          </span>
        )}
      </div>
    </div>
  );
}
