import express from 'express';
import { AIService } from '../services/aiService.js';
import { UploadService } from '../services/uploadService.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema for extract request
const ExtractRequestSchema = z.object({
  fileId: z.string(),
  model: z.enum(['gemini']) // Only Gemini is supported (free)
});

// POST /api/extract - Extract data from PDF using AI
router.post('/', async (req, res) => {
  try {
    const { fileId, model } = ExtractRequestSchema.parse(req.body);
    
    // Get the PDF file path
    const filePath = await UploadService.getFilePath(fileId);
    
    // Dynamically import pdf-parse to avoid initialization issues
    const pdf = (await import('pdf-parse')).default;
    
    // Read and parse the PDF
    const pdfBuffer = await import('fs').then(fs => fs.promises.readFile(filePath));
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
