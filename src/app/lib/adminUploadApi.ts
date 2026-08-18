import api from './axios';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

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
  uploadFile: (file: File) => {
    const formData = new FormData();

    // Backend expects "files"
    formData.append('files', file);

    return api.post<ApiResponse<UploadResponseData>>(
      '/api/v1/files',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      }
    );
  },

  uploadFiles: async (files: File[]) => {
    const results = await Promise.all(
      files.map((file) => uploadApi.uploadFile(file))
    );

    return results
      .map((res) => extractUploadedUrl(res.data.data))
      .filter(Boolean);
  },
};

export function extractUploadedUrl(data: UploadResponseData): string {
  return data?.files?.[0]?.url ?? '';
}
