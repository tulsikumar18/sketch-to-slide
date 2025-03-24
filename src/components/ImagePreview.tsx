import { ProcessingStage, UploadedImage } from "@/pages/Index";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, X, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface ImagePreviewProps {
  image: UploadedImage;
  processingStage: ProcessingStage;
}

export const ImagePreview = ({ image, processingStage }: ImagePreviewProps) => {
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(false);

  const isProcessing = processingStage === "processing";
  const isComplete = processingStage === "complete";

  const increaseZoom = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const decreaseZoom = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  const handleDownload = () => {
    const downloadUrl = image.supabaseUrl || image.url;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = image.file.name || 'smartboard-slide.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className={`relative overflow-hidden min-h-[400px] ${isProcessing ? 'grayscale-[0.5]' : ''}`}>
        <div className="overflow-auto h-[400px] flex items-center justify-center">
          <div
            style={{ 
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s ease-out',
            }}
            className="relative will-change-transform origin-center"
          >
            <motion.img 
              src={image.url} 
              alt="Preview" 
              className="max-w-full object-contain shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {isProcessing && (
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                <div className="p-4 rounded-full bg-white/80 animate-spin-slow">
                  <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            )}

            {isComplete && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 bg-black/5 flex items-center justify-center"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/90 shadow-elevation-1 backdrop-blur-sm p-4 rounded-lg max-w-xs text-center space-y-3"
                >
                  <div className="inline-flex bg-green-100 p-2 rounded-full">
                    <svg 
                      className="h-6 w-6 text-green-600" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Processing Complete!</h3>
                  <p className="text-sm text-gray-600">Your slides are ready to be downloaded.</p>
                  <Button 
                    className="w-full flex items-center justify-center gap-2" 
                    variant="default"
                    onClick={handleDownload}
                  >
                    <Download size={16} />
                    <span>Download Slides</span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div 
        className={`absolute bottom-4 right-4 flex gap-2 transition-opacity duration-200 ${
          showControls || isComplete ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-subtle"
          onClick={decreaseZoom}
        >
          <ZoomOut size={14} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-subtle"
          onClick={increaseZoom}
        >
          <ZoomIn size={14} />
        </Button>
      </div>

      <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 shadow-subtle">
          {image.file.name} ({Math.round(image.file.size / 1024)} KB)
        </div>
        
        <Button
          size="icon"
          variant="secondary"
          className={`h-7 w-7 bg-white/80 backdrop-blur-sm shadow-subtle transition-opacity duration-200 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};
