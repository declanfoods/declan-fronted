import { useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractUploadedUrl, uploadApi } from '../../../shared/uploads/api';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { readAvatarOverride, writeAvatarOverride } from '../userAvatar';

interface ProfileAvatarProps {
  userId: string;
  serverPhotoUrl: string | null;
  fullName: string;
  initials: string;
}

export default function ProfileAvatar({
  userId,
  serverPhotoUrl,
  fullName,
  initials,
}: ProfileAvatarProps) {
  const [avatarOverride, setAvatarOverride] = useState(() => readAvatarOverride(userId));
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Let the same file be picked again after a failure.
    event.target.value = '';
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('That image is larger than 5MB. Please choose a smaller one.');
      return;
    }

    setUploadingPhoto(true);

    try {
      const res = await uploadApi.uploadFile(file, 'customer');
      const url = extractUploadedUrl(res.data.data);

      if (!url) {
        toast.error('The upload succeeded but no image URL came back.');
        return;
      }

      writeAvatarOverride(userId, url);
      setAvatarOverride(url);

      toast.success('Profile picture updated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not upload the picture.'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (!userId) return;

    writeAvatarOverride(userId, null);
    setAvatarOverride(null);
    toast.success('Profile picture removed.');
  };

  const photoUrl = avatarOverride ?? serverPhotoUrl;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            className="h-28 w-28 rounded-full border-4 border-primary object-cover shadow-md"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary bg-white text-4xl font-bold text-primary shadow-md">
            {initials || '👤'}
          </div>
        )}

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelected}
        />

        <button
          type="button"
          disabled={uploadingPhoto}
          onClick={() => photoInputRef.current?.click()}
          aria-label={photoUrl ? 'Change profile picture' : 'Add a profile picture'}
          className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
        >
          {uploadingPhoto ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Camera size={16} />
          )}
        </button>
      </div>

      {avatarOverride && !uploadingPhoto && (
        <button
          type="button"
          onClick={handleRemovePhoto}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500"
        >
          <Trash2 size={13} />
          Remove picture
        </button>
      )}

      <h2 className="mt-4 text-2xl font-bold text-ink">
        {fullName}
      </h2>
    </div>
  );
}
