export const formatProfileDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
