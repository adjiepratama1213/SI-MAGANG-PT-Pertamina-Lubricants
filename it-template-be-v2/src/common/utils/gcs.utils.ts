// utils/gcs.utils.ts

import { Storage } from '@google-cloud/storage';
import { URL } from 'url';

const storage = new Storage(
  process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'staging' && {
      keyFilename: process.env.GCP_PATH, // Path to your service account key file
    }
);
const bucketName = process.env.GCP_BUCKET_NAME; // Name of your bucket

export async function generateSignedUrl(coverUrl: string): Promise<string> {
  try {
    // Extract and decode the file path from the URL
    const url = new URL(coverUrl);
    let filePath = decodeURIComponent(url.pathname.substring(1)); // Remove leading '/' and decode

    // Remove the `bucketName` prefix from the file path
    const bucketPrefix = `${bucketName}/`;
    if (filePath.startsWith(bucketPrefix)) {
      filePath = filePath.substring(bucketPrefix.length); // Remove the bucket name from the path
    }

    // Remove the extra `certificateofquality` prefix if present
    const extraPrefix = 'certificateofquality/';
    if (filePath.startsWith(extraPrefix)) {
      filePath = filePath.substring(extraPrefix.length); // Remove the extra prefix
    }

    // Generate a signed URL for the file
    const file = storage.bucket(bucketName).file(filePath);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 60 minutes
      // expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    return signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw error;
  }
}
