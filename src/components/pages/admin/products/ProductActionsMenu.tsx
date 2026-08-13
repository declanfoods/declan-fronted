import { Eye, Pencil, EyeOff, Eye as EyeIcon, Ban, ChevronRight } from 'lucide-react';

type ProductActionsMenuProps = {
  product: { name: string; sku: string; price: string; img: string };
  isHidden?: boolean;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onToggleHide: () => void;
  onMarkOutOfStock: () => void;
};

export default function ProductActionsMenu({
  product,
  isHidden,
  onClose,
  onView,
  onEdit,
  onToggleHide,
  onMarkOutOfStock,
}: ProductActionsMenuProps) {
  const actions = [
    { label: 'View Product', icon: Eye, onClick: onView },
    { label: 'Edit Details', icon: Pencil, onClick: onEdit },
    {
      label: isHidden ? 'Unhide from Customers' : 'Hide from Customers',
      icon: isHidden ? EyeIcon : EyeOff,
      onClick: onToggleHide,
    },
    { label: 'Mark Out of Stock', icon: Ban, onClick: onMarkOutOfStock },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-3 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />

        <div className="mb-4 flex items-center gap-3">
          {product.img ? (
            <img src={product.img} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            <span className="h-12 w-12 rounded-xl bg-gray-100" />
          )}
          <div>
            <p className="font-bold text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-400">
              SKU: {product.sku} • {product.price}
            </p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="flex items-center gap-3 py-4 text-left text-sm font-medium text-gray-800"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7EE] text-primary">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="flex-1">{action.label}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}