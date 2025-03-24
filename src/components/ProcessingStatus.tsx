
import { ProcessingStage } from "@/pages/Index";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface ProcessingStatusProps {
  stage: ProcessingStage;
}

export const ProcessingStatus = ({ stage }: ProcessingStatusProps) => {
  const getStatusInfo = () => {
    switch (stage) {
      case "uploading":
        return {
          title: "Uploading image...",
          description: "Please wait while we upload your image",
          progress: 30,
        };
      case "processing":
        return {
          title: "Processing image...",
          description: "Analyzing and converting to slides",
          progress: 70,
        };
      case "complete":
        return {
          title: "Processing complete!",
          description: "Your slides are ready to download",
          progress: 100,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        };
      case "error":
        return {
          title: "Processing failed",
          description: "There was an error processing your image",
          progress: 100,
          icon: <XCircle className="h-5 w-5 text-red-500" />,
        };
      default:
        return {
          title: "Standby",
          description: "Ready to process your image",
          progress: 0,
        };
    }
  };

  const { title, description, progress, icon } = getStatusInfo();

  const isComplete = stage === "complete";
  const isError = stage === "error";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-morphism rounded-lg p-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{title}</span>
              {icon && <span>{icon}</span>}
            </div>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
          
          {(!isComplete && !isError) && (
            <div className="mt-3 relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ 
                  duration: stage === "uploading" ? 1.5 : 3,
                  ease: "easeInOut" 
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
