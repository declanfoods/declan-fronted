export function formatDateTime(iso: string | null): string {
  if (!iso) return 'N/A';

  return new Date(iso).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
