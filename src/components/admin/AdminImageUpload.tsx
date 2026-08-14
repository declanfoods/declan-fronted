import { useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { uploadApi, extractUploadedUrl } from '../../app/lib/adminUploadApi';

type AdminImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  heightClassName?: string;
  helperText?: string;
  compact?: boolean;
};

export default function AdminImageUpload({
  value,
  onChange,
  heightClassName = 'h-40',
  helperText,
  compact,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const res = await uploadApi.uploadFile(file);
      const url = extractUploadedUrl(res.data.data);
      if (!url) {
        setError('Upload succeeded but no URL was returned.');
        return;
      }
      onChange(url);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-3">
          {value ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-xl">
              <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {uploading ? (
                <Loader2 size={18} className="animate-spin text-primary" />
              ) : (
                <>
                  <Camera size={18} className="text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-500">Upload</span>
                </>
              )}
            </label>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {value ? (
        <div className={`relative w-full overflow-hidden rounded-2xl ${heightClassName}`}>
          <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-center ${heightClassName}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin text-primary" />
              <span className="text-sm font-semibold text-gray-700">Uploading...</span>
            </>
          ) : (
            <>
              <Camera size={22} className="text-gray-400" />
              <span className="px-8 text-sm font-semibold text-gray-700">
                {helperText ?? 'Tap to upload an image'}
              </span>
              <span className="text-xs text-gray-400">Supports JPG, PNG, WEBP</span>
            </>
          )}
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}