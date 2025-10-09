import { S3Client } from '@aws-sdk/client-s3';

// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: process.env.AWS_REGION });

export { s3Client };
