import cloudinary from '../../config/cloudinary.config';

export const uploadImage = (buffer: Buffer, folder: string) => {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Upload failed"));
                }

                return resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        ).end(buffer);
    });
};

export const deleteImage = (publicId: string) => {
    return cloudinary.uploader.destroy(publicId);
};
