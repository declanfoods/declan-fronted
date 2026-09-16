import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';

/*
|--------------------------------------------------------------------------
| RowActionsMenu — the "three dots" menu on list rows
|--------------------------------------------------------------------------
| FIX: every three-dots button in the admin app was a DEAD BUTTON.
|
| It looked like this:
|
|     <button type="button" aria-label="More actions">
|       <MoreVertical size={18} />
|     </button>
|
| No onClick. No menu. Clicking it did absolutely nothing — which reads as a
| broken screen, because a control that looks interactive and then doesn't
| respond is worse than no control at all. Affected:
|
|   - /admin/users          (each user card)
|   - /admin/referrals/members (each member card)
|
| This component renders the button AND a real menu. It handles:
|   - outside-click to close
|   - Escape to close
|   - real <a> for links (so target="_blank" works)
|   - disabled rows marked "SOON" for actions with no backend endpoint yet
*/

export type RowAction = {
  label: string;
  icon?: ReactNode;
  /** In-page navigation. Ignored if `href` is set. */
  onClick?: () => void;
  /** Renders a real anchor so it can open in a new tab. */
  href?: string;
  newTab?: boolean;
  danger?: boolean;
  /** No backend endpoint exists — renders greyed out with a SOON badge. */
  unavailable?: boolean;
};

type Props = {
  actions: RowAction[];
  /** Accessible label for the trigger button. */
  label?: string;
  align?: 'left' | 'right';
};

export default function RowActionsMenu({
  actions,
  label = 'More actions',
  align = 'right',
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape. Without this the menu stays open forever
  // and stacks on top of every other row's menu.
  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const itemClass = (action: RowAction) =>
    [
      'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
      action.unavailable
        ? 'cursor-not-allowed text-gray-300'
        : action.danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50',
    ].join(' ');

  const inner = (action: RowAction) => (
    <>
      {action.icon && <span className="shrink-0">{action.icon}</span>}
      <span className="flex-1">{action.label}</span>
      {action.unavailable && (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
          SOON
        </span>
      )}
    </>
  );

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          open ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-10 z-30 w-56 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {actions.map((action) => {
            // Unavailable actions get no handler at all — clicking must not
            // pretend to do something and then fail.
            if (action.unavailable) {
              return (
                <span key={action.label} className={itemClass(action)} aria-disabled="true">
                  {inner(action)}
                </span>
              );
            }

            if (action.href) {
              return (
                <a
                  key={action.label}
                  href={action.href}
                  {...(action.newTab
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  onClick={() => setOpen(false)}
                  className={itemClass(action)}
                  role="menuitem"
                >
                  {inner(action)}
                </a>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
                className={itemClass(action)}
              >
                {inner(action)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}