import api from './axios';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

// The backend's exact response shape for /api/v1/files isn't documented yet,
// so we defensively read whichever of these fields comes back.
interface UploadResponseData {
  url?: string;
  imageUrl?: string;
  fileUrl?: string;
  secure_url?: string;
  [key: string]: unknown;
}

export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<ApiResponse<UploadResponseData>>('/api/v1/files', formData, {
      headers: {
        // Let the browser set the multipart boundary itself — overriding
        // the axios instance's default 'application/json' header.
        'Content-Type': undefined,
      },
    });
  },

  uploadFiles: async (files: File[]) => {
    const results = await Promise.all(files.map((file) => uploadApi.uploadFile(file)));
    return results.map((res) => extractUploadedUrl(res.data.data));
  },
};

export function extractUploadedUrl(data: UploadResponseData): string {
  return data.url ?? data.imageUrl ?? data.fileUrl ?? data.secure_url ?? '';
}