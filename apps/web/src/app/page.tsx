'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';
import PDFViewer from '@/components/PDFViewer';
import InvoiceForm from '@/components/InvoiceForm';
import axios from 'axios';

interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface Vendor {
  name: string;
  address?: string;
  taxId?: string;
}

interface InvoiceData {
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

interface Invoice {
  _id: string;
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: InvoiceData;
  createdAt: string;
  updatedAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load invoices on component mount
  React.useEffect(() => {
    if (mounted) {
      loadInvoices();
    }
  }, [mounted]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/invoices`);
      setInvoices(response.data.data.invoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setCurrentFile(file);
      
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadedFileId(response.data.data.fileId);
      toast.success('PDF uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload PDF');
    }
  };

  const handleExtract = async () => {
    if (!uploadedFileId) {
      toast.error('Please upload a PDF first');
      return;
    }

    try {
      setIsExtracting(true);
      const response = await axios.post(`${API_BASE_URL}/extract`, {
        fileId: uploadedFileId,
        model: 'gemini' // Only use Gemini (free)
      });
      
      // Update the form with extracted data
      const extractedData = {
        _id: '',
        fileId: uploadedFileId,
        fileName: currentFile?.name || '',
        vendor: response.data.data.vendor,
        invoice: response.data.data.invoice,
        createdAt: new Date().toISOString()
      };
      
      console.log('Dashboard: Setting extracted data:', extractedData);
      setSelectedInvoice(extractedData);
      
      toast.success('Data extracted successfully');
    } catch (error) {
      console.error('Error extracting data:', error);
      toast.error('Failed to extract data from PDF');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setIsSaving(true);
      
      const invoiceData = {
        fileId: uploadedFileId || selectedInvoice?.fileId,
        fileName: currentFile?.name || selectedInvoice?.fileName,
        ...data
      };

      if (selectedInvoice?._id) {
        // Update existing invoice
        await axios.put(`${API_BASE_URL}/invoices/${selectedInvoice._id}`, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        // Create new invoice
        await axios.post(`${API_BASE_URL}/invoices`, invoiceData);
        toast.success('Invoice saved successfully');
      }
      
      loadInvoices();
      setSelectedInvoice(null);
      setCurrentFile(null);
      setUploadedFileId(null);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/invoices/${invoiceId}`);
      toast.success('Invoice deleted successfully');
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewerOpen(true);
  };

  // Get currency symbol based on currency code
  const getCurrencySymbol = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RUB': '₽',
      'BRL': 'R$',
      'MXN': '$',
      'ZAR': 'R',
      'KRW': '₩',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'THB': '฿',
      'MYR': 'RM',
      'IDR': 'Rp',
      'PHP': '₱',
      'VND': '₫'
    };
    
    return currencyMap[currency?.toUpperCase()] || currency || '₹';
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.invoice.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Invoice Dashboard</h1>
          <p className="text-gray-600">Upload PDFs, extract data with AI, and manage invoices</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* PDF Upload */}
          <div className="h-[600px]">
            <PDFViewer
              fileUrl={currentFile ? URL.createObjectURL(currentFile) : undefined}
              onFileSelect={handleFileSelect}
            />
          </div>

          {/* Invoice Form */}
          <div className="h-[600px]">
            <InvoiceForm
              key={selectedInvoice?._id || 'new'}
              initialData={selectedInvoice ? {
                vendor: selectedInvoice.vendor,
                invoice: selectedInvoice.invoice
              } : undefined}
              onSave={handleSave}
              onExtract={handleExtract}
              isExtracting={isExtracting}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Invoices</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by vendor name or invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={loadInvoices} variant="outline">
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No invoices found</p>
                {searchQuery && (
                  <p className="text-sm mt-1">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">
                        {invoice.vendor.name}
                      </TableCell>
                      <TableCell>{invoice.invoice.number}</TableCell>
                      <TableCell>
                        {new Date(invoice.invoice.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getCurrencySymbol(invoice.invoice.currency || 'INR')}{invoice.invoice.total?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {invoice.fileName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Invoice Dialog */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedInvoice ? `${selectedInvoice.vendor.name} - ${selectedInvoice.invoice.number}` : 'Invoice Details'}
              </DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gray-800">Vendor Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedInvoice.vendor.name}</p>
                      {selectedInvoice.vendor.address && (
                        <p><strong>Address:</strong> {selectedInvoice.vendor.address}</p>
                      )}
                      {selectedInvoice.vendor.taxId && (
                        <p><strong>Tax ID:</strong> {selectedInvoice.vendor.taxId}</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gray-800">Invoice Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Number:</strong> {selectedInvoice.invoice.number}</p>
                      <p><strong>Date:</strong> {new Date(selectedInvoice.invoice.date).toLocaleDateString()}</p>
                      {selectedInvoice.invoice.currency && (
                        <p><strong>Currency:</strong> {selectedInvoice.invoice.currency}</p>
                      )}
                      {selectedInvoice.invoice.poNumber && (
                        <p><strong>PO Number:</strong> {selectedInvoice.invoice.poNumber}</p>
                      )}
                      {selectedInvoice.invoice.poDate && (
                        <p><strong>PO Date:</strong> {new Date(selectedInvoice.invoice.poDate).toLocaleDateString()}</p>
                      )}
                      {selectedInvoice.invoice.taxPercent && (
                        <p><strong>Tax %:</strong> {selectedInvoice.invoice.taxPercent}%</p>
                      )}
                      {selectedInvoice.invoice.subtotal && (
                        <p><strong>Subtotal:</strong> {getCurrencySymbol(selectedInvoice.invoice.currency || 'INR')}{selectedInvoice.invoice.subtotal.toFixed(2)}</p>
                      )}
                      {selectedInvoice.invoice.total && (
                        <p><strong>Total:</strong> {getCurrencySymbol(selectedInvoice.invoice.currency || 'INR')}{selectedInvoice.invoice.total.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedInvoice.invoice.lineItems.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gray-800">Line Items</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-sm">Description</TableHead>
                            <TableHead className="text-sm">Unit Price</TableHead>
                            <TableHead className="text-sm">Quantity</TableHead>
                            <TableHead className="text-sm">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedInvoice.invoice.lineItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-sm">{item.description}</TableCell>
                              <TableCell className="text-sm">{getCurrencySymbol(selectedInvoice.invoice.currency || 'INR')}{item.unitPrice.toFixed(2)}</TableCell>
                              <TableCell className="text-sm">{item.quantity}</TableCell>
                              <TableCell className="text-sm font-medium">{getCurrencySymbol(selectedInvoice.invoice.currency || 'INR')}{item.total.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}