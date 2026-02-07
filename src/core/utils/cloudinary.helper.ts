import cloudinary from '../../config/cloudinary.config';
import sharp from 'sharp';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export const uploadImage = async (buffer: Buffer, folder: string) => {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        unique_filename: true,
        use_filename: false,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error || !result) {
          return reject(new Error(error?.message || 'Upload failed'));
        }

        // Step 2: Enable Auto Compression (f_auto,q_auto) in the URL
        const optimizedUrl = result.secure_url.replace(
          '/upload/',
          '/upload/f_auto,q_auto/',
        );

        return resolve({
          url: optimizedUrl,
          publicId: result.public_id,
        });
      },
    );

    // Step 5: Streaming Upload (Pipe Sharp -> Cloudinary)
    // Directly pipe the processing stream to the upload stream
    sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true }) // aggressive max width for speed
      .jpeg({ quality: 60, mozjpeg: true }) // 60% quality + mozjpeg for smaller size
      .pipe(uploadStream)
      .on('error', (err) => reject(err));
  });
};

export const deleteImage = (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};
