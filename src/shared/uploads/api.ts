import api from '../../app/lib/axios';

import type { ApiResponse } from '../../app/lib/api-types';
import type { SessionRole } from '../../features/auth/session';

interface UploadedFile {
  id: string;
  uploadServiceId: string;
  url: string;
  createdAt: string;
}

interface UploadResponseData {
  files: UploadedFile[];
}

export const uploadApi = {
  uploadFile: (file: File, authScope: SessionRole) => {
    const formData = new FormData();

    // Backend expects "files"
    formData.append('files', file);

    return api.post<ApiResponse<UploadResponseData>>(
      '/api/v1/files',
      formData,
      {
        authScope,
        headers: {
          'Content-Type': undefined,
        },
      }
    );
  },
};

export function extractUploadedUrl(data: UploadResponseData): string {
  return data?.files?.[0]?.url ?? '';
}
