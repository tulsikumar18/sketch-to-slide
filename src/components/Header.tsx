
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Github } from "lucide-react";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10"
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1">
            <span className="h-8 w-8 bg-brand-blue rounded inline-flex items-center justify-center text-white font-bold">S</span>
            <span className="h-8 w-8 bg-brand-red rounded inline-flex items-center justify-center text-white font-bold">B</span>
            <span className="h-8 w-8 bg-brand-yellow rounded inline-flex items-center justify-center text-white font-bold">2</span>
            <span className="h-8 w-8 bg-brand-green rounded inline-flex items-center justify-center text-white font-bold">S</span>
          </div>
          <div className="font-medium text-lg tracking-tight hidden md:block">Smart Board to Slide</div>
        </div>
        
        <nav className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2 items-center">
            <Github size={16} />
            <span>GitHub</span>
          </Button>
          <Button variant="default" size="sm">
            Get Started
          </Button>
        </nav>
      </div>
    </motion.header>
  );
};
