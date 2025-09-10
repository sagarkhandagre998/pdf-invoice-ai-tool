import express from 'express';
import { AIService } from '../services/aiService.js';
import { UploadService } from '../services/uploadService.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema for extract request
const ExtractRequestSchema = z.object({
  fileId: z.string(),
  model: z.enum(['gemini']), // Only Gemini is supported (free)
  fileUrl: z.string().optional() // Vercel Blob URL for the PDF
});

// POST /api/extract - Extract data from PDF using AI
router.post('/', async (req, res) => {
  try {
    const { fileId, model, fileUrl } = ExtractRequestSchema.parse(req.body);
    
    // For Vercel Blob, we need to fetch the PDF from the URL
    let pdfBuffer: Buffer;
    
    if (fileUrl) {
      // Fetch PDF from Vercel Blob URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
      }
      pdfBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      // Fallback: try to get from local storage (for development)
      try {
        const filePath = await UploadService.getFilePath(fileId);
        pdfBuffer = await import('fs').then(fs => fs.promises.readFile(filePath));
      } catch (error) {
        throw new Error('No file URL provided and local file not found. Please upload the file first.');
      }
    }
    
    // Dynamically import pdf-parse to avoid initialization issues
    const pdf = (await import('pdf-parse')).default;
    const pdfData = await pdf(pdfBuffer);
    
    // Extract data using AI
    const aiService = new AIService();
    const extractedData = await aiService.extractDataFromPDF(pdfData.text, model);
    
    res.json({
      success: true,
      data: extractedData
    });
  } catch (error) {
    console.error('Extraction error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.issues
      });
    }
    
    res.status(500).json({
      error: 'Extraction failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
