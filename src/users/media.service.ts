import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  async uploadToCloudinary(file: Express.Multer.File): Promise<{
    url: string;
    publicId: string;
    resourceType: string;
  }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.configureCloudinary();

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? 'rent-management',
          resource_type: 'auto',
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (!uploadResult) {
            reject(new BadRequestException('Cloudinary upload failed'));
            return;
          }

          resolve(uploadResult);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  }

  private configureCloudinary(): void {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new BadRequestException('Cloudinary environment variables are missing');
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }
}
