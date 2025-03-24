
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="border-t border-slate-200 py-6 bg-white/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 text-center text-sm text-gray-500">
        <p className="mb-2">
          Smart Board to Slide Deck Converter &copy; {new Date().getFullYear()}
        </p>
        <p>
          Built with React, TailwindCSS and Framer Motion
        </p>
      </div>
    </motion.footer>
  );
};
