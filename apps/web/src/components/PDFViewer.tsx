'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import PDFViewerCanvas with SSR disabled
const PDFViewerCanvas = dynamic(() => import('./PDFViewerCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF Viewer...</p>
      </div>
    </div>
  )
});

interface PDFViewerProps {
  fileUrl?: string;
  onFileSelect: (file: File) => void;
}

export default function PDFViewer({ fileUrl, onFileSelect }: PDFViewerProps) {
  const [dragOver, setDragOver] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [showUpload, setShowUpload] = useState(!fileUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
      setShowUpload(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
      setShowUpload(false);
    }
  };

  const handlePDFError = () => {
    setUseFallback(true);
  };

  const handleNewUpload = () => {
    setShowUpload(true);
    setUseFallback(false);
    // Reset the file input
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          PDF Viewer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {!fileUrl || showUpload ? (
          /* Upload Area */
          <div 
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-upload')?.click()}
          >
            <div className="text-center">
              <Upload className="h-20 w-20 text-blue-500 mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-900 mb-2">Upload Your PDF Invoice</p>
              <p className="text-sm text-gray-600 mb-6">
                Click here or drag and drop your PDF file
              </p>
              
              <Button 
                size="lg" 
                className="mb-4"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('pdf-upload')?.click();
                }}
              >
                <Upload className="h-5 w-5 mr-2" />
                Choose PDF File
              </Button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
                <p className="text-sm text-blue-800 font-medium">
                  📄 Supported: PDF files up to 25MB
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* PDF Viewer */
          useFallback ? (
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg overflow-auto">
              <iframe 
                src={fileUrl} 
                className="w-full h-full border-none rounded-lg"
                title="PDF Viewer"
              />
            </div>
          ) : (
            <PDFViewerCanvas 
              fileUrl={fileUrl} 
              onError={handlePDFError}
              onNewUpload={handleNewUpload}
            />
          )
        )}

        {/* Hidden File Input */}
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
