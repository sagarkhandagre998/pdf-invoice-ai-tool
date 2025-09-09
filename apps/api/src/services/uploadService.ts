import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

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
  static async saveFile(file: Express.Multer.File): Promise<{ fileId: string; fileName: string }> {
    const fileId = path.basename(file.filename, path.extname(file.filename));
    return {
      fileId,
      fileName: file.originalname
    };
  }

  static async getFilePath(fileId: string): Promise<string> {
    // In a real application, you might want to store file paths in a database
    // For now, we'll assume the file exists in the uploads directory
    const files = await fs.readdir(uploadsDir);
    const file = files.find(f => f.startsWith(fileId));
    
    if (!file) {
      throw new Error('File not found');
    }
    
    return path.join(uploadsDir, file);
  }

  static async deleteFile(fileId: string): Promise<void> {
    try {
      const filePath = await this.getFilePath(fileId);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error if file doesn't exist
    }
  }
}
