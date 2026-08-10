import { Storage } from '@google-cloud/storage';

export async function uploadFileToGCS(file: File) {
  const storage = new Storage();
  const bucket = storage.bucket('YOUR_BUCKET_NAME');
  const blob = bucket.file(file.name);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', reject);
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });
    blobStream.end(file);
  });
}