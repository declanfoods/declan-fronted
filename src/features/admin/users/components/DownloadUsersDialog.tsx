import { useRef, useState, type FormEvent } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import Button from '../../../../shared/ui/Button';
import {
  adminUserExportColumns,
  type AdminUserExportColumn,
  type AdminUserExportFormat,
} from '../api';
import { describeDownloadError, downloadUsers } from '../download';

const allColumns = adminUserExportColumns.map(({ key }) => key);
const fieldClassName = 'w-full min-w-0 rounded-xl border border-gray-200 bg-white px-2 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary sm:px-3';
const checkboxClassName = 'h-4 w-4 shrink-0 accent-primary';

export default function DownloadUsersDialog() {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<AdminUserExportFormat>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeSuspended, setIncludeSuspended] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(allColumns);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const downloadInProgress = useRef(false);

  const invalidDates = Boolean(startDate && endDate && startDate > endDate);
  const noColumns = selectedColumns.length === 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (downloadInProgress.current) return;
    if (nextOpen) {
      setFormat('csv');
      setStartDate('');
      setEndDate('');
      setIncludeSuspended(false);
      setSelectedColumns(allColumns);
      setError('');
    }
    setOpen(nextOpen);
  };

  const setColumn = (key: AdminUserExportColumn, checked: boolean) => {
    setSelectedColumns((columns) =>
      checked ? [...columns, key] : columns.filter((column) => column !== key),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (downloadInProgress.current || invalidDates || noColumns) return;

    downloadInProgress.current = true;
    setIsDownloading(true);
    setError('');

    try {
      await downloadUsers({
        format,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        includeSuspended,
        columns: allColumns.filter((key) => selectedColumns.includes(key)),
      });
      setOpen(false);
    } catch (error) {
      setError(await describeDownloadError(error));
    } finally {
      downloadInProgress.current = false;
      setIsDownloading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button type="button" size="sm" variant="secondary" className="gap-2">
          <Download size={16} aria-hidden="true" />
          Download users
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <Dialog.Title className="text-lg font-bold text-gray-900">Download users</Dialog.Title>
            <Dialog.Close asChild>
              <Button type="button" size="sm" variant="ghost" className="p-2 text-gray-500 disabled:opacity-50" disabled={isDownloading} aria-label="Close">
                <X size={20} aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
            <div className="overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
              <fieldset disabled={isDownloading} className="min-w-0 space-y-4 text-sm text-gray-700 disabled:opacity-60">
                <label className="block space-y-1.5 font-medium">
                  <span>File format</span>
                  <select value={format} onChange={(event) => setFormat(event.target.value as AdminUserExportFormat)} className={fieldClassName}>
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                  </select>
                </label>

                <fieldset className="min-w-0">
                  <legend className="mb-2 font-semibold">Join dates (optional, UTC)</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block min-w-0 space-y-1.5">
                      <span>Start date</span>
                      <input
                        type="date"
                        max="9999-12-31"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        aria-invalid={invalidDates || undefined}
                        aria-describedby={invalidDates ? 'export-date-error' : undefined}
                        className={fieldClassName}
                      />
                    </label>
                    <label className="block min-w-0 space-y-1.5">
                      <span>End date</span>
                      <input
                        type="date"
                        max="9999-12-31"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        aria-invalid={invalidDates || undefined}
                        aria-describedby={invalidDates ? 'export-date-error' : undefined}
                        className={fieldClassName}
                      />
                    </label>
                  </div>
                  {invalidDates && (
                    <p id="export-date-error" role="alert" className="mt-2 text-red-600">Start date must be on or before the end date.</p>
                  )}
                </fieldset>

                <label className="flex items-center gap-2 py-1 font-medium">
                  <input
                    type="checkbox"
                    checked={includeSuspended}
                    onChange={(event) => setIncludeSuspended(event.target.checked)}
                    className={checkboxClassName}
                  />
                  Include suspended users
                </label>

                <fieldset className="min-w-0 border-t border-gray-100 pt-2" aria-describedby={noColumns ? 'export-columns-error' : undefined}>
                  <legend className="pr-2 font-semibold">Columns</legend>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="ghost" className="px-2 text-primary disabled:opacity-50" onClick={() => setSelectedColumns(allColumns)} disabled={selectedColumns.length === allColumns.length}>
                      Select all
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="px-2 text-primary disabled:opacity-50" onClick={() => setSelectedColumns([])} disabled={noColumns}>
                      Clear all
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3">
                    {adminUserExportColumns.map(({ key, label }) => (
                      <label key={key} className="flex min-h-9 items-start gap-2 py-2 leading-5">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(key)}
                          onChange={(event) => setColumn(key, event.target.checked)}
                          className={`${checkboxClassName} mt-0.5`}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  {noColumns && (
                    <p id="export-columns-error" role="alert" className="mt-2 text-red-600">Select at least one column.</p>
                  )}
                </fieldset>
              </fieldset>
            </div>

            <div className="space-y-3 border-t border-gray-100 px-5 py-4 sm:px-6">
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full gap-2 text-sm disabled:opacity-50" disabled={isDownloading || invalidDates || noColumns}>
                {isDownloading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {isDownloading ? 'Downloading…' : 'Download'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
