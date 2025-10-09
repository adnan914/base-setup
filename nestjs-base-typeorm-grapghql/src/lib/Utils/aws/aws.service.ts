/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3.client'; // Ensure this client is properly initialized
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConstantConfig } from 'src/lib/constant/constant.config';
interface ExtData {
  // Define the structure for ExtData
}
@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);

  constructor(private configService: ConfigService, private constant:ConstantConfig) {}

  async getPresignedUrlForArray(folder: string, extArray: any): Promise<any[]> {
    try {
      const s3Urls: any[] = [];

      for (let i = 0; i < extArray.ext.length; i++) {
        const fileStoragePath = `uploads/${folder}/${Date.now().toString()}${
          extArray.ext[i]
        }`;
        const params: any = {
          Bucket: this.configService.get<string>('AWS_BUCKET'),
          Key: fileStoragePath,
          ACL: 'public-read',
        };

        const command = new PutObjectCommand(params);
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        if (signedUrl) {
          s3Urls.push({
            signedUrl,
            photo_path: fileStoragePath,
          });
        }
      }

      return s3Urls;
    } catch (err) {
      this.logger.error(this.constant.error.auth.aws.presignedUrlsError, err);
      throw err;
    }
  }

  async getPresignedUrl(
    path: string,
    ext: any,
  ): Promise<{ signedUrl: string; photo_path: string }> {
    try {
      const photo_path = `uploads/${path}${ext}`;
      const params: any = {
        Bucket: this.configService.get<string>('AWS_BUCKET'),
        Key: photo_path,
        ACL: 'public-read',
      };

      const command = new PutObjectCommand(params);
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      return { signedUrl, photo_path };
    } catch (err) {
      this.logger.error(this.constant.error.auth.aws.presignedUrlsError, err);
      throw new Error(err.message);
    }
  }

  async generateVersionNormalUrl(
    url: string,
  ): Promise<{ original: string; small: string; medium: string } | {}> {
    if (url && url.length > 0) {
      return { original: url, small: url, medium: url };
    } else {
      return {};
    }
  }
  async deleteObject(key: string): Promise<any> {
    try {
      const result = await s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.configService.get<string>('AWS_BUCKET'),
          Key: key,
        }),
      );
      return result;
    } catch (e) {
      this.logger.error(this.constant.error.auth.aws.deleteObjectS3Error, e);
      throw e; // Rethrowing the error is more aligned with NestJS's exception handling
    }
  }

  async generateVersionUrls(url: any) {
    const path = url.split('.com')[1]?.substring(1);
    const lastStr = url.lastIndexOf('.');
    const ext = url.substring(lastStr + 1);

    if (!path) {
      return {};
    } else if (ext.toLowerCase() === 'heic') {
      return {
        original: url,
        medium: url,
        small: url,
      };
    } else {
      return {
        original: await this.generateUrl(path, {
          resize: { width: 1000, height: 1000 },
        }),
        medium: await this.generateUrl(path, {
          resize: { width: 300, height: 300 },
        }),
        small: await this.generateUrl(path, {
          resize: { width: 150, height: 150 },
        }),
      };
    }
  }

  private async generateUrl(path: string, size = {}): Promise<string> {
    try {
      const options = {
        bucket: this.configService.get<string>('AWS_BUCKET'),
        key: path,
        edits: size,
      };
      const objJsonStr = JSON.stringify(options);
      const objJsonB64 = Buffer.from(objJsonStr).toString('base64');
      const imageUrl = `${this.configService.get<string>(
        'AWS_CLOUDFRONT_URL',
      )}/${objJsonB64}`;
      return imageUrl;
    } catch (e) {
      this.logger.error(this.constant.error.auth.aws.urlError ,e);
      throw new Error(this.constant.error.auth.aws.wentWrong);
    }
  }
}
