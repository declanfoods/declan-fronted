export function formatAmount(amount: unknown) {
  const value = Number(amount);
  return Number.isNaN(value) ? '—' : `₦${value.toLocaleString()}`;
}
