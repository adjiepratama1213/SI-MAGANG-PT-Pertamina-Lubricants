// utils/gcs.utils.ts

import { Storage } from '@google-cloud/storage';
import { URL } from 'url';
import * as path from 'path';
import * as fs from 'fs';

const gcpKeyPath = process.env.GCP_PATH
  ? path.resolve(process.cwd(), process.env.GCP_PATH)
  : path.resolve(process.cwd(), 'gcp', 'ptpl-devops-dev-d78ab6daf01c.json');

export const gcsStorage = new Storage({
  keyFilename: fs.existsSync(gcpKeyPath) ? gcpKeyPath : undefined,
  projectId: process.env.GCP_PROJECT_ID || 'ptpl-devops-dev',
});

export const bucketName = process.env.GCP_BUCKET_NAME || 'certificateofquality';
export const gcsBucket = gcsStorage.bucket(bucketName);

/**
 * Upload Buffer langsung ke Google Cloud Storage bucket
 */
export async function uploadBufferToGcs(
  buffer: Buffer,
  destinationPath: string,
  contentType = 'application/octet-stream'
): Promise<{ gcpPath: string; publicUrl: string }> {
  const file = gcsBucket.file(destinationPath);
  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      contentType,
    },
  });

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
  return { gcpPath: destinationPath, publicUrl };
}

/**
 * Upload file lokal dari disk ke Google Cloud Storage bucket
 */
export async function uploadLocalFileToGcs(
  localFilePath: string,
  destinationPath: string,
  contentType?: string
): Promise<{ gcpPath: string; publicUrl: string }> {
  const file = gcsBucket.file(destinationPath);
  await new Promise((resolve, reject) => {
    fs.createReadStream(localFilePath)
      .pipe(
        file.createWriteStream({
          contentType,
          resumable: false,
        })
      )
      .on('finish', resolve)
      .on('error', reject);
  });

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
  return { gcpPath: destinationPath, publicUrl };
}

/**
 * Cek apakah file ada di Google Cloud Storage bucket
 */
export async function checkFileExistsInGcs(filePath: string): Promise<boolean> {
  try {
    const file = gcsBucket.file(filePath);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error('Error checking file exists in GCS:', error);
    return false;
  }
}

/**
 * Generate Signed URL v4 untuk mengakses file private di GCS
 */
export async function generateSignedUrl(coverUrl: string, expireMinutes = 60): Promise<string> {
  try {
    const url = new URL(coverUrl);
    let filePath = decodeURIComponent(url.pathname.substring(1));

    const bucketPrefix = `${bucketName}/`;
    if (filePath.startsWith(bucketPrefix)) {
      filePath = filePath.substring(bucketPrefix.length);
    }

    const extraPrefix = 'certificateofquality/';
    if (filePath.startsWith(extraPrefix)) {
      filePath = filePath.substring(extraPrefix.length);
    }

    const file = gcsBucket.file(filePath);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expireMinutes * 60 * 1000,
    });

    return signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw error;
  }
}
