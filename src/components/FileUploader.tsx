
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, RefreshCw, Image as ImageIcon } from "lucide-react";
import { ProcessingStage } from "@/pages/Index";
import { toast } from "sonner";

interface FileUploaderProps {
  onImageUpload: (file: File) => void;
  onReset: () => void;
  disabled: boolean;
  processingStage: ProcessingStage;
}

export const FileUploader = ({ onImageUpload, onReset, disabled, processingStage }: FileUploaderProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useState<HTMLVideoElement | null>(null);
  const canvasRef = useState<HTMLCanvasElement | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      // Check if file size is greater than 15MB
      if (file.size > 15 * 1024 * 1024) {
        toast.error("File size exceeds 15MB limit");
        return;
      }
      
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
    accept: {
      'image/*': []
    },
    disabled,
    maxFiles: 1,
  });

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef[0]) {
        videoRef[0].srcObject = stream;
        videoRef[0].play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Unable to access camera");
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (videoRef[0] && canvasRef[0]) {
      const video = videoRef[0];
      const canvas = canvasRef[0];
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onImageUpload(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef[0] && videoRef[0].srcObject) {
      const stream = videoRef[0].srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef[0].srcObject = null;
    }
    setIsCapturing(false);
  };

  const hasProcessedImage = processingStage === "complete";

  return (
    <div className="space-y-6">
      {!isCapturing ? (
        <>
          <div
            {...getRootProps()}
            className={`border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'drag-over' : 'border-gray-200 hover:border-primary/50'
            } ${disabled ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-primary/10 p-3 rounded-full"
              >
                <Upload className="h-7 w-7 text-primary" />
              </motion.div>
              <div className="space-y-1">
                <h3 className="font-medium text-gray-800">Drag & drop image</h3>
                <p className="text-sm text-gray-500">or click to browse files</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">Supports: JPG, PNG, WEBP (Max: 15MB)</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full flex items-center gap-2 font-normal"
              onClick={startCamera}
              disabled={disabled}
            >
              <Camera size={18} className="text-primary" />
              <span>Take a photo</span>
            </Button>
            
            <AnimatePresence>
              {hasProcessedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full flex items-center gap-2 font-normal"
                    onClick={onReset}
                  >
                    <RefreshCw size={18} className="text-primary" />
                    <span>Start over</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Recent uploads</h4>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div className="bg-gray-200 rounded flex items-center justify-center p-2">
                <ImageIcon size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">whiteboard-meeting.jpg</p>
                <p className="text-xs text-gray-500">2.3 MB</p>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden bg-black aspect-video relative">
            <video 
              ref={el => (videoRef[0] = el)} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
              muted
            />
            <canvas ref={el => (canvasRef[0] = el)} className="hidden" />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button 
                onClick={captureImage}
                size="sm" 
                variant="default"
                className="rounded-full h-12 w-12 p-0"
              >
                <span className="sr-only">Capture</span>
                <div className="h-5 w-5 rounded-full bg-white"></div>
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={stopCamera}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
