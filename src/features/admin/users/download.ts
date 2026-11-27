import { isAxiosError } from 'axios';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { adminUserApi, type AdminUserExportRequest } from './api';

function readFilename(disposition: unknown): string | undefined {
  if (typeof disposition !== 'string') return;

  const encoded = /(?:^|;)\s*filename\*\s*=\s*UTF-8'[^']*'([^;]+)/i.exec(disposition)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded.trim());
    } catch {
      // A plain filename can still be available when the encoded one is malformed.
    }
  }

  const plain = /(?:^|;)\s*filename\s*=\s*(?:"([^"]*)"|([^;]*))/i.exec(disposition);
  return (plain?.[1] ?? plain?.[2])?.trim();
}

export async function downloadUsers(request: AdminUserExportRequest) {
  const { data, headers } = await adminUserApi.downloadList(request);
  const filename = readFilename(headers['content-disposition']) || `users.${request.format}`;
  const link = document.createElement('a');
  const url = URL.createObjectURL(data);
  link.href = url;
  link.download = filename;

  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function describeDownloadError(error: unknown): Promise<string> {
  if (!isAxiosError(error)) return 'Could not download users. Please try again.';

  const response = error.response;
  if (!response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'The export request timed out. Please try again.';
    }
    return 'Could not reach the server. Check your connection and try again.';
  }

  const fallback = `Could not download users (HTTP ${response.status}). Please try again.`;
  try {
    const body = response.data instanceof Blob ? await response.data.text() : response.data;
    const data = typeof body === 'string' ? JSON.parse(body) : body;
    return getApiErrorMessage({ response: { data } }, fallback);
  } catch {
    return fallback;
  }
}
