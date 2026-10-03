import { ArrowUpDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SortDropdownProps {
  sortBy: string | undefined;
  sortOrder: 'ASC' | 'DESC' | undefined;
  onChangeSortBy: (value: string | undefined) => void;
  onChangeSortOrder: (value: 'ASC' | 'DESC') => void;
}

const SORT_BY_OPTIONS: { label: string; value: string }[] = [
  { label: 'Price',   value: 'price' },
  { label: 'Name',    value: 'name' },
  { label: 'Date',    value: 'date' },
  { label: 'Rating',  value: 'rating' },
];

const SORT_ORDER_OPTIONS: { label: string; value: 'ASC' | 'DESC' }[] = [
  { label: 'Ascending',  value: 'ASC' },
  { label: 'Descending', value: 'DESC' },
];



interface SortDropdownProps {
  sortBy: string | undefined;
  sortOrder: 'ASC' | 'DESC' | undefined;
  onChangeSortBy: (value: string | undefined) => void;
  onChangeSortOrder: (value: 'ASC' | 'DESC') => void;
}

export function AdminProductSortDropdown({ sortBy, sortOrder, onChangeSortBy, onChangeSortOrder }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  // Position the portal panel directly below the button
  const openPanel = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top:  rect.bottom + 8,
      left: rect.left,
      zIndex: 9999,
    });
    setOpen(true);
  };

  // Close on outside click — must check both button and panel
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isActive = Boolean(sortBy);

  const panel = (
    <div
      ref={panelRef}
      style={panelStyle}
      className="w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
    >
      {/* Sort by */}
      <div className="px-4 pb-2 pt-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Sort by
        </p>
        {SORT_BY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              // Tapping the active option clears it
              onChangeSortBy(sortBy === opt.value ? undefined : opt.value);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {opt.label}
            {sortBy === opt.value && <Check size={14} className="text-primary" />}
          </button>
        ))}
      </div>

      <div className="mx-4 border-t border-gray-100" />

      {/* Order */}
      <div className="px-4 pb-3 pt-2">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Order
        </p>
        {SORT_ORDER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChangeSortOrder(opt.value);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {opt.label}
            {(sortOrder ?? 'DESC') === opt.value && (
              <Check size={14} className="text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
          isActive
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-200 text-gray-500'
        }`}
      >
        <ArrowUpDown size={14} />
        Sort
        {isActive && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </button>

      {open && createPortal(panel, document.body)}
    </>
  );
}
