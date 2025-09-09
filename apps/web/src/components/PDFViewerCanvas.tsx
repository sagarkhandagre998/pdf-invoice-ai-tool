'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, Maximize2, RotateCw, Upload } from 'lucide-react';

interface PDFViewerCanvasProps {
  fileUrl: string;
  onError?: () => void;
  onNewUpload?: () => void;
}

export default function PDFViewerCanvas({ fileUrl, onError, onNewUpload }: PDFViewerCanvasProps) {
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetZoom = () => {
    setScale(1.0);
    setRotation(0);
  };

  const downloadPDF = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'document.pdf';
      link.click();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const iframeStyle = {
    transform: `scale(${scale}) rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    transition: 'transform 0.3s ease',
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '8px'
  };

  return (
    <div className={`flex-1 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            PDF Viewer
          </span>
          {onNewUpload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNewUpload}
              className="ml-2"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload New PDF
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={rotate}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
          >
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPDF}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg overflow-auto">
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ 
            overflow: 'auto',
            padding: isFullscreen ? '20px' : '10px'
          }}
        >
          <iframe 
            src={fileUrl} 
            style={iframeStyle}
            title="PDF Viewer"
            className="shadow-lg"
          />
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white shadow-lg"
          >
            Exit Fullscreen
          </Button>
        </div>
      )}
    </div>
  );
}
