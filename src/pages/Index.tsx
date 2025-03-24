import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ImagePreview } from "@/components/ImagePreview";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Types
export type ProcessingStage = "idle" | "uploading" | "processing" | "complete" | "error";
export type UploadedImage = {
  url: string;
  file: File;
  supabaseUrl?: string;
};

const Index = () => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("idle");

  const handleImageUpload = async (file: File, supabaseUrl: string) => {
    try {
      setProcessingStage("uploading");
      
      // Create an object URL for the image preview
      const imageUrl = URL.createObjectURL(file);
      setImage({ url: imageUrl, file, supabaseUrl });
      
      // We're already uploaded to Supabase at this point, so we can move to processing
      setProcessingStage("processing");
      
      // Simulate processing delay (in a real app, you would process the image on the server)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Store record in Supabase database
      const { error } = await supabase
        .from('image_uploads')
        .insert([
          { 
            file_name: file.name, 
            file_size: file.size, 
            file_type: file.type,
            storage_url: supabaseUrl,
            processed: true
          }
        ]);
      
      if (error) {
        console.error("Error storing image record:", error);
        // We continue anyway since the image is already stored
      }
      
      // Success
      setProcessingStage("complete");
      toast.success("Image processed successfully! Your slides are ready.");
      
    } catch (error) {
      console.error("Error processing image:", error);
      setProcessingStage("error");
      toast.error("Failed to process image. Please try again.");
    }
  };

  const resetState = () => {
    if (image) {
      URL.revokeObjectURL(image.url);
    }
    setImage(null);
    setProcessingStage("idle");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Smart Board to Slide Deck Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your whiteboard images into professional slide decks with ease.
            Upload an image to get started.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5 lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="uploader"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-morphism rounded-xl p-6"
              >
                <FileUploader 
                  onImageUpload={handleImageUpload}
                  disabled={processingStage !== "idle" && processingStage !== "error"}
                  processingStage={processingStage}
                  onReset={resetState}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="md:col-span-7 lg:col-span-8">
            <AnimatePresence mode="wait">
              {processingStage === "idle" && !image ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="glass-morphism rounded-xl p-8 h-full flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="text-center space-y-4">
                    <div className="bg-primary/10 p-6 rounded-full inline-block mb-4">
                      <svg 
                        className="w-16 h-16 text-primary/70" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M3 15h18" />
                        <path d="M9 3v18" />
                        <path d="M15 3v18" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-800">No Image Preview</h3>
                    <p className="text-gray-500">
                      Upload an image of your whiteboard to see the preview here
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass-morphism rounded-xl overflow-hidden"
                >
                  {image && (
                    <ImagePreview 
                      image={image} 
                      processingStage={processingStage} 
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {processingStage !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <ProcessingStatus stage={processingStage} />
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
