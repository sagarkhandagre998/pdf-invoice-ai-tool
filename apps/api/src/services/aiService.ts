import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Validation schema for extracted data
const ExtractedDataSchema = z.object({
  vendor: z.object({
    name: z.string(),
    address: z.string().optional(),
    taxId: z.string().optional()
  }),
  invoice: z.object({
    number: z.string(),
    date: z.string(),
    currency: z.string().nullable().optional().transform(val => val || 'INR'), // Handle null and provide default
    subtotal: z.number().optional(),
    taxPercent: z.number().optional(),
    total: z.number().optional(),
    poNumber: z.string().optional(),
    poDate: z.string().optional(),
    lineItems: z.array(z.object({
      description: z.string(),
      unitPrice: z.number(),
      quantity: z.number(),
      total: z.number()
    }))
  })
});

export type ExtractedData = z.infer<typeof ExtractedDataSchema>;

export class AIService {
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async extractDataFromPDF(pdfText: string, model: 'gemini'): Promise<ExtractedData> {
    const prompt = this.createExtractionPrompt(pdfText);

    try {
      console.log('Starting extraction with Gemini...');
      
      // Check API key
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // Extract using Gemini
      const extractedText = await this.extractWithGemini(prompt);

      // Clean the extracted text to remove markdown formatting
      const cleanedText = this.cleanJsonResponse(extractedText);

      console.log('Raw AI response:', extractedText);
      console.log('Cleaned response:', cleanedText);

      // Parse and validate the extracted data
      const parsedData = JSON.parse(cleanedText);
      return ExtractedDataSchema.parse(parsedData);
    } catch (error) {
      console.error('Error extracting data with Gemini:', error);
      throw new Error(`Failed to extract data with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If the response is empty or just {}, return a default structure
    if (!cleaned || cleaned === '{}') {
      return JSON.stringify({
        vendor: {
          name: "Unknown Vendor",
          address: "",
          taxId: ""
        },
        invoice: {
          number: "Unknown",
          date: new Date().toISOString().split('T')[0],
          currency: "INR", // Default to INR for Indian invoices
          subtotal: 0,
          taxPercent: 18, // Default IGST rate for India
          total: 0,
          poNumber: "",
          poDate: new Date().toISOString().split('T')[0], // Default to today's date
          lineItems: []
        }
      });
    }
    
    // Parse and fix null currency values
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.invoice && parsed.invoice.currency === null) {
        parsed.invoice.currency = "INR"; // Default to INR for Indian invoices
      }
      return JSON.stringify(parsed);
    } catch (error) {
      // If parsing fails, return the cleaned text as is
      return cleaned;
    }
  }

  private createExtractionPrompt(pdfText: string): string {
    return `
You are an AI assistant specialized in extracting structured data from invoice PDFs. 
Extract the following information from the provided PDF text and return it as a valid JSON object.

PDF Text:
${pdfText}

Please extract and return ONLY a JSON object with this exact structure:
{
  "vendor": {
    "name": "string (required)",
    "address": "string (optional)",
    "taxId": "string (optional)"
  },
  "invoice": {
    "number": "string (required)",
    "date": "string (required, format: YYYY-MM-DD)",
    "currency": "string (optional, default: USD - look for currency symbols ₹, $, €, £, ¥ or codes INR, USD, EUR, GBP, JPY)",
    "subtotal": "number (optional)",
    "taxPercent": "number (optional - look for IGST rate, GST rate, tax percentage, or similar)",
    "total": "number (optional)",
    "poNumber": "string (optional - look for PO No, Purchase Order No, P.O. No)",
    "poDate": "string (optional, format: YYYY-MM-DD - look for PO Date, Purchase Order Date, P.O. Date)",
    "lineItems": [
      {
        "description": "string (required)",
        "unitPrice": "number (required)",
        "quantity": "number (required)",
        "total": "number (required)"
      }
    ]
  }
}

IMPORTANT EXTRACTION NOTES:

TAX EXTRACTION:
- Look for "IGST rate", "GST rate", "Tax %", "Tax Rate", "VAT rate", or similar terms
- Extract the percentage value (e.g., if you see "IGST @ 18%", extract 18)
- If multiple tax rates are mentioned, use the main/primary rate
- Convert percentage to decimal if needed (e.g., 18% = 18, not 0.18)

PURCHASE ORDER (PO) EXTRACTION:
- Look for "PO Date", "Purchase Order Date", "P.O. Date", "Order Date", "PO No", "Purchase Order No", "P.O. No"
- Extract PO number and date from these fields
- For dates, convert to YYYY-MM-DD format
- Look for patterns like "PO: 12345" or "Purchase Order: ABC-2024-001"

       CURRENCY EXTRACTION:
       - Look for currency symbols like "₹", "$", "€", "£", "¥", "INR", "USD", "EUR", "GBP", "JPY"
       - Look for text like "Currency:", "Amount in:", "Total in:", "INR", "USD", "EUR", "GBP"
       - Extract the currency code (e.g., INR, USD, EUR) or symbol
       - If you see "₹" symbol or "INR" mentioned, use "INR"
       - If you see "$" symbol or "USD" mentioned, use "USD"
       - If no currency is found, use "INR" (default for Indian invoices)
       - Common patterns: "₹ 1000", "$1000", "INR 1000", "Amount in USD"
       - NEVER return null for currency - always provide a valid currency code

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON object, no markdown formatting, no code blocks
- Do NOT wrap the response in \`\`\`json or \`\`\`
- If a field is not found, omit it (don't use null)
- For dates, use YYYY-MM-DD format
- For numbers, use actual numbers, not strings
- Extract all line items from the invoice
- Be accurate and conservative - if unsure, omit the field
- The response must be valid JSON that can be parsed directly
`;
  }

  private async extractWithGemini(prompt: string): Promise<string> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

}
