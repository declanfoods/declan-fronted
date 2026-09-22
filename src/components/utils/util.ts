export function formatDate(iso: string | null): string {
 return iso ?
        new Date(iso).toLocaleDateString('en-NG', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) : "N/A";
} 