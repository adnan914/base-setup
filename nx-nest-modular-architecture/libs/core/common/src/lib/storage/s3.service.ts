import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly prefix: string;

  constructor() {
    this.bucket = (process.env['AWS_S3_BUCKET'] || process.env['S3_BUCKET'] || '').trim();
    this.region = (process.env['AWS_REGION'] || process.env['S3_REGION'] || 'ap-south-1').trim();
    this.prefix = (process.env['AWS_S3_PREFIX'] || process.env['S3_PREFIX'] || '').trim().replace(/^\/+|\/+$/g, '');

    const accessKeyId = process.env['S3_ACCESS_KEY_ID'];
    const secretAccessKey = process.env['S3_SECRET_ACCESS_KEY'];
    
    if (!this.bucket) {
      this.logger.warn('S3_BUCKET is not configured.');
    }

    this.client = new S3Client({
      region: this.region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  private resolveKey(key: string): string {
    const sanitized = String(key || '').trim().replace(/^\/+/, '');
    if (this.prefix && sanitized.startsWith(this.prefix + '/')) {
      return sanitized;
    }
    return [this.prefix, sanitized].filter(Boolean).join('/');
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
    if (!this.bucket) {
      throw new InternalServerErrorException('S3 bucket is not configured.');
    }

    const resolvedKey = this.resolveKey(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: resolvedKey,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return resolvedKey;
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.bucket) {
      return key; 
    }

    const resolvedKey = this.resolveKey(key);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: resolvedKey,
    });

    try {
      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${resolvedKey}`, error);
      return key;
    }
  }
}
