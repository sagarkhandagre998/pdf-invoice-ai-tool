'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, Bot } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  total: z.number().min(0, 'Total must be positive')
});

const invoiceFormSchema = z.object({
  vendor: z.object({
    name: z.string().min(1, 'Vendor name is required'),
    address: z.string().optional(),
    taxId: z.string().optional()
  }),
  invoice: z.object({
    number: z.string().min(1, 'Invoice number is required'),
    date: z.string().min(1, 'Invoice date is required'),
    currency: z.string().optional(),
    subtotal: z.number().optional(),
    taxPercent: z.number().optional(),
    total: z.number().optional(),
    poNumber: z.string().optional(),
    poDate: z.string().optional(),
    lineItems: z.array(lineItemSchema)
  })
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSave: (data: InvoiceFormData) => void;
  onExtract: () => void;
  isExtracting?: boolean;
  isSaving?: boolean;
}

export default function InvoiceForm({ 
  initialData, 
  onSave, 
  onExtract, 
  isExtracting = false,
  isSaving = false 
}: InvoiceFormProps) {
  // Removed model selection since we only use Gemini (free)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      vendor: {
        name: '',
        address: '',
        taxId: ''
      },
      invoice: {
        number: '',
        date: '',
        currency: 'INR',
        subtotal: 0,
        taxPercent: 0,
        total: 0,
        poNumber: '',
        poDate: '',
        lineItems: []
      }
    }
  });

  // Reset form when initialData changes (e.g., after AI extraction)
  React.useEffect(() => {
    if (initialData) {
      console.log('InvoiceForm: Resetting form with data:', initialData);
      form.reset(initialData);
    }
  }, [initialData, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invoice.lineItems'
  });

  const watchedLineItems = form.watch('invoice.lineItems');

  // Calculate totals when line items change
  React.useEffect(() => {
    const subtotal = watchedLineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxPercent = form.getValues('invoice.taxPercent') || 0;
    const taxAmount = subtotal * (taxPercent / 100);
    const total = subtotal + taxAmount;

    form.setValue('invoice.subtotal', subtotal);
    form.setValue('invoice.total', total);
  }, [watchedLineItems, form]);

  const addLineItem = () => {
    append({
      description: '',
      unitPrice: 0,
      quantity: 1,
      total: 0
    });
  };

  const removeLineItem = (index: number) => {
    remove(index);
  };

  const updateLineItemTotal = (index: number) => {
    const lineItems = form.getValues('invoice.lineItems');
    const item = lineItems[index];
    if (item) {
      const total = item.unitPrice * item.quantity;
      form.setValue(`invoice.lineItems.${index}.total`, total);
    }
  };

  const onSubmit = (data: InvoiceFormData) => {
    onSave(data);
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
    
    return currencyMap[currency?.toUpperCase()] || currency || '$';
  };

  const currentCurrency = form.watch('invoice.currency') || 'INR';
  const currencySymbol = getCurrencySymbol(currentCurrency);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Invoice Data</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={onExtract}
            disabled={isExtracting}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            {isExtracting ? 'Extracting...' : 'Extract with AI (Gemini)'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Vendor Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Vendor Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="vendor.name">Vendor Name *</Label>
                <Input
                  id="vendor.name"
                  {...form.register('vendor.name')}
                  className={form.formState.errors.vendor?.name ? 'border-red-500' : ''}
                />
                {form.formState.errors.vendor?.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.vendor.name.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="vendor.address">Address</Label>
                <Textarea
                  id="vendor.address"
                  {...form.register('vendor.address')}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="vendor.taxId">Tax ID</Label>
                <Input
                  id="vendor.taxId"
                  {...form.register('vendor.taxId')}
                />
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Invoice Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice.number">Invoice Number *</Label>
                <Input
                  id="invoice.number"
                  {...form.register('invoice.number')}
                  className={form.formState.errors.invoice?.number ? 'border-red-500' : ''}
                />
                {form.formState.errors.invoice?.number && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.invoice.number.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="invoice.date">Invoice Date *</Label>
                <Input
                  id="invoice.date"
                  type="date"
                  {...form.register('invoice.date')}
                  className={form.formState.errors.invoice?.date ? 'border-red-500' : ''}
                />
                {form.formState.errors.invoice?.date && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.invoice.date.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="invoice.currency">Currency</Label>
                <Input
                  id="invoice.currency"
                  {...form.register('invoice.currency')}
                />
              </div>
              
              <div>
                <Label htmlFor="invoice.poNumber">PO Number</Label>
                <Input
                  id="invoice.poNumber"
                  {...form.register('invoice.poNumber')}
                />
              </div>
              
              <div>
                <Label htmlFor="invoice.poDate">PO Date</Label>
                <Input
                  id="invoice.poDate"
                  type="date"
                  {...form.register('invoice.poDate')}
                />
              </div>
              
              <div>
                <Label htmlFor="invoice.taxPercent">Tax %</Label>
                <Input
                  id="invoice.taxPercent"
                  type="number"
                  step="0.01"
                  {...form.register('invoice.taxPercent', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold">Line Items</h3>
              <Button type="button" onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Input
                            {...form.register(`invoice.lineItems.${index}.description`)}
                            className="border-0 p-0 h-auto"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`invoice.lineItems.${index}.unitPrice`, { 
                              valueAsNumber: true,
                              onChange: () => updateLineItemTotal(index)
                            })}
                            className="border-0 p-0 h-auto"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            {...form.register(`invoice.lineItems.${index}.quantity`, { 
                              valueAsNumber: true,
                              onChange: () => updateLineItemTotal(index)
                            })}
                            className="border-0 p-0 h-auto"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`invoice.lineItems.${index}.total`, { valueAsNumber: true })}
                            className="border-0 p-0 h-auto"
                            readOnly
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{form.watch('invoice.subtotal')?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{currencySymbol}{((form.watch('invoice.subtotal') || 0) * ((form.watch('invoice.taxPercent') || 0) / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{currencySymbol}{form.watch('invoice.total')?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
