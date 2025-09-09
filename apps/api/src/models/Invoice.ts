import mongoose, { Document, Schema } from 'mongoose';

export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Vendor {
  name: string;
  address?: string;
  taxId?: string;
}

export interface InvoiceData {
  number: string;
  date: string;
  currency?: string;
  subtotal?: number;
  taxPercent?: number;
  total?: number;
  poNumber?: string;
  poDate?: string;
  lineItems: LineItem[];
}

export interface IInvoice extends Document {
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: InvoiceData;
  createdAt: Date;
  updatedAt?: Date;
}

const LineItemSchema = new Schema<LineItem>({
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const VendorSchema = new Schema<Vendor>({
  name: { type: String, required: true },
  address: { type: String },
  taxId: { type: String }
}, { _id: false });

const InvoiceDataSchema = new Schema<InvoiceData>({
  number: { type: String, required: true },
  date: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  subtotal: { type: Number },
  taxPercent: { type: Number },
  total: { type: Number },
  poNumber: { type: String },
  poDate: { type: String },
  lineItems: [LineItemSchema]
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  fileId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  vendor: { type: VendorSchema, required: true },
  invoice: { type: InvoiceDataSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Update the updatedAt field before saving
InvoiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
InvoiceSchema.index({ 'vendor.name': 'text', 'invoice.number': 'text' });
InvoiceSchema.index({ createdAt: -1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
