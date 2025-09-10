import express from 'express';
import { Invoice } from '../models/Invoice.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const CreateInvoiceSchema = z.object({
  fileId: z.string(),
  fileName: z.string(),
  fileUrl: z.string().optional(), // For production (Vercel Blob URL)
  vendor: z.object({
    name: z.string(),
    address: z.string().optional(),
    taxId: z.string().optional()
  }),
  invoice: z.object({
    number: z.string(),
    date: z.string(),
    currency: z.string().optional(),
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

const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

// GET /api/invoices - List all invoices with optional search
router.get('/', async (req, res) => {
  try {
    const { q, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (q) {
      query = {
        $or: [
          { 'vendor.name': { $regex: q, $options: 'i' } },
          { 'invoice.number': { $regex: q, $options: 'i' } }
        ]
      };
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('List invoices error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/invoices/:id - Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/invoices - Create new invoice
router.post('/', async (req, res) => {
  try {
    const invoiceData = CreateInvoiceSchema.parse(req.body);
    
    // Check if invoice with same fileId already exists
    const existingInvoice = await Invoice.findOne({ fileId: invoiceData.fileId });
    if (existingInvoice) {
      return res.status(409).json({ error: 'Invoice with this file already exists' });
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid invoice data',
        details: error.issues
      });
    }

    res.status(500).json({
      error: 'Failed to create invoice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/invoices/:id - Update invoice
router.put('/:id', async (req, res) => {
  try {
    const updateData = UpdateInvoiceSchema.parse(req.body);
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid update data',
        details: error.issues
      });
    }

    res.status(500).json({
      error: 'Failed to update invoice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      error: 'Failed to delete invoice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
