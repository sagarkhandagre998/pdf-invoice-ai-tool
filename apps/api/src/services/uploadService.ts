import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { put } from '@vercel/blob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use Vercel Blob for both development and production
// This allows testing the full functionality locally

// Configure multer for file uploads - always use memory storage for Vercel Blob
const storage = multer.memoryStorage();

// File filter for PDFs only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  }
});

export class UploadService {
  static async saveFile(file: Express.Multer.File): Promise<{ fileId: string; fileName: string; fileUrl: string }> {
    // Always use Vercel Blob for both development and production
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const blob = await put(fileName, file.buffer, {
      access: 'public',
      contentType: 'application/pdf'
    });
    
    return {
      fileId: fileName.replace(path.extname(fileName), ''),
      fileName: file.originalname,
      fileUrl: blob.url
    };
  }

  static async getFilePath(fileId: string): Promise<string> {
    // File URLs are now stored in the database
    // This method is kept for backward compatibility but should not be used
    throw new Error('File URL should be retrieved from database - use fileUrl field instead');
  }

  static async deleteFile(fileId: string): Promise<void> {
    // File deletion would require the blob URL from the database
    // This would need to be implemented with the Vercel Blob delete API
    console.log('File deletion should be handled via Vercel Blob API using the stored fileUrl');
  }
}
