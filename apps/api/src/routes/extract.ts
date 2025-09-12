import express from 'express';
import { AIService } from '../services/aiService.js';
import { UploadService } from '../services/uploadService.js';
import { QuotaHelper } from '../utils/quotaHelper.js';
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
    
    // Handle quota exceeded errors with specific status code
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const quotaInfo = QuotaHelper.getQuotaInfo(error);
      return res.status(429).json({
        error: 'API Quota Exceeded',
        message: error.message,
        quotaInfo,
        retryAfter: quotaInfo.retryAfter,
        suggestions: quotaInfo.suggestions
      });
    }
    
    // Handle API key errors
    if (error instanceof Error && error.message.includes('API key')) {
      return res.status(401).json({
        error: 'API Configuration Error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Extraction failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/extract/quota - Check quota status
router.get('/quota', (req, res) => {
  try {
    const quotaUsage = QuotaHelper.getQuotaUsageEstimate();
    
    res.json({
      success: true,
      quota: quotaUsage,
      info: {
        freeTierLimit: 50,
        resetPeriod: '24 hours',
        upgradeUrl: 'https://ai.google.dev/pricing'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get quota information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
