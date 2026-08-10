import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';

// The maximum file size limit in bytes (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Define the destination and filename for storing uploaded files
const storage = diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where files will be stored
    const uploadDir = './uploads';
    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid overwriting existing files
    // Use the original file extension for the uploaded file
    cb(null, `${new Date().toISOString().substring(0, 10)}_${extname(file.originalname)}`);
  },
});

// Define file filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/x-pdf',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST), false);
  }
};

export const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // Set the file size limit
  },
};
