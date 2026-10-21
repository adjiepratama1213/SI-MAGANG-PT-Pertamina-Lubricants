const { Storage } = require('@google-cloud/storage');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const keyPath = path.resolve(__dirname, process.env.GCP_PATH || 'gcp/ptpl-devops-dev-d78ab6daf01c.json');
const bucketName = process.env.GCP_BUCKET_NAME || 'certificateofquality';

const searchKeyword = (process.argv[2] || '').toLowerCase();

const storage = new Storage({
  keyFilename: keyPath,
  projectId: process.env.GCP_PROJECT_ID || 'ptpl-devops-dev',
});

async function checkGcp() {
  console.log('\n=======================================================');
  console.log('   PEMANTAUAN BERKAS GOOGLE CLOUD STORAGE (GCS)');
  console.log('=======================================================');
  console.log('Project ID    :', process.env.GCP_PROJECT_ID || 'ptpl-devops-dev');
  console.log('Bucket Target :', bucketName);
  console.log('Kredensial SA :', keyPath);
  if (searchKeyword) {
    console.log('Filter Kata   :', searchKeyword);
  }
  console.log('-------------------------------------------------------\n');

  try {
    const bucket = storage.bucket(bucketName);
    const [exists] = await bucket.exists();
    if (!exists) {
      console.error(`❌ Bucket "${bucketName}" tidak ditemukan di project ini!`);
      return;
    }

    console.log(`⏳ Mengambil daftar berkas dari Google Cloud Storage...`);
    // Ambil berkas dari bucket dengan prefix yang tepat agar cepat dan akurat
    const knownFolders = ['documents', 'users', 'laporan', 'presensi', 'reminders', 'certificates'];
    let prefix = 'uploads';
    if (searchKeyword.startsWith('uploads')) {
      prefix = searchKeyword;
    } else if (knownFolders.includes(searchKeyword)) {
      prefix = `uploads/${searchKeyword}`;
    }

    const options = { prefix, maxResults: 500 };
    const [files] = await bucket.getFiles(options);

    if (!files || files.length === 0) {
      console.log('ℹ️ Belum ada berkas yang cocok.');
      return;
    }

    // Filter berkas
    let filteredFiles = files;
    if (searchKeyword) {
      filteredFiles = files.filter((f) => f.name.toLowerCase().includes(searchKeyword));
    }

    // Ambil metadata untuk 25 berkas pertama agar cepat
    const topFiles = filteredFiles.slice(0, 25);
    const fileDetails = await Promise.all(
      topFiles.map(async (file) => {
        try {
          const [metadata] = await file.getMetadata();
          return {
            name: file.name,
            size: metadata.size ? (parseInt(metadata.size, 10) / 1024).toFixed(1) + ' KB' : '0 KB',
            updated: metadata.updated ? new Date(metadata.updated) : new Date(0),
          };
        } catch {
          return {
            name: file.name,
            size: '-',
            updated: new Date(0),
          };
        }
      })
    );

    fileDetails.sort((a, b) => b.updated - a.updated);

    console.log(`✅ Berhasil! Ditemukan total ${filteredFiles.length} berkas yang cocok:\n`);

    const tableData = fileDetails.map((f, idx) => ({
      No: idx + 1,
      'Nama Berkas / Path di GCP': f.name,
      Ukuran: f.size,
      'Waktu Upload (WIB)': f.updated.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }));

    console.table(tableData);

    if (filteredFiles.length > 25) {
      console.log(`\n... dan ${filteredFiles.length - 25} berkas lainnya di GCP.`);
    }

    console.log('\n💡 Tips Pengecekan:');
    console.log('- Cek berkas upload terbaru : node check-gcp-files.js uploads');
    console.log('- Cek berkas laporan magang : node check-gcp-files.js laporan');
    console.log('- Cek berkas dokumen peserta: node check-gcp-files.js documents');
    console.log('- Cek bukti presensi        : node check-gcp-files.js presensi\n');
  } catch (err) {
    console.error('❌ Gagal memeriksa GCP:', err.message);
  }
}

checkGcp();
