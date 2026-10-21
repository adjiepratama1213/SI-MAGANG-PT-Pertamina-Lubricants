const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const keyPath = path.resolve(__dirname, process.env.GCP_PATH || 'gcp/ptpl-devops-dev-d78ab6daf01c.json');
const bucketName = process.env.GCP_BUCKET_NAME || 'certificateofquality';

console.log('=== Sinkronisasi Berkas Lokal ke Google Cloud Storage ===');
console.log('Service Account Key:', keyPath);
console.log('GCP Target Bucket  :', bucketName);

if (!fs.existsSync(keyPath)) {
  console.error('File kunci GCP tidak ditemukan di:', keyPath);
  process.exit(1);
}

const storage = new Storage({
  keyFilename: keyPath,
  projectId: process.env.GCP_PROJECT_ID || 'ptpl-devops-dev',
});

const bucket = storage.bucket(bucketName);

function getFilesRecursively(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({ fullPath, relPath, size: stat.size });
    }
  }
  return results;
}

async function syncAll() {
  const uploadsDir = path.join(__dirname, 'uploads');
  const allFiles = getFilesRecursively(uploadsDir);
  console.log(`Ditemukan ${allFiles.length} berkas di folder uploads/ lokal.`);

  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const item = allFiles[i];
    const gcpDest = `uploads/${item.relPath}`;
    const gcpFile = bucket.file(gcpDest);

    try {
      const [exists] = await gcpFile.exists();
      if (exists) {
        console.log(`[${i + 1}/${allFiles.length}] (Lewati - Sudah Ada di GCP) ${gcpDest}`);
        skippedCount++;
        continue;
      }

      console.log(`[${i + 1}/${allFiles.length}] Mengunggah ke GCP: ${gcpDest} (${(item.size / 1024).toFixed(1)} KB)...`);
      await new Promise((resolve, reject) => {
        fs.createReadStream(item.fullPath)
          .pipe(gcpFile.createWriteStream({ resumable: false }))
          .on('finish', resolve)
          .on('error', reject);
      });
      console.log(`  -> Berhasil!`);
      successCount++;
    } catch (err) {
      console.error(`  -> Gagal mengunggah ${gcpDest}:`, err.message);
      failCount++;
    }
  }

  console.log('\n=== Hasil Sinkronisasi Selesai ===');
  console.log(`Total Berkas  : ${allFiles.length}`);
  console.log(`Berhasil Unggah: ${successCount}`);
  console.log(`Sudah Ada     : ${skippedCount}`);
  console.log(`Gagal         : ${failCount}`);
}

syncAll().catch(err => {
  console.error('Fatal error during sync:', err);
});
