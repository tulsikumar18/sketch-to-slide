
import { jsPDF } from 'jspdf';
import { SlideData } from './types';

/**
 * Generates a PDF document from the slide data
 */
export const generatePdf = async (slideData: SlideData): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(54, 54, 54);
      pdf.text(slideData.title || "Whiteboard to Slides", 20, 20);
      
      // Add subtitle
      pdf.setFontSize(12);
      pdf.setTextColor(102, 102, 102);
      pdf.text("Automatically generated from whiteboard image", 20, 30);
      
      // Add the extracted text
      if (slideData.extractedText && slideData.extractedText.trim()) {
        pdf.setFontSize(12);
        pdf.setTextColor(54, 54, 54);
        
        const textLines = pdf.splitTextToSize(slideData.extractedText, 250);
        pdf.text(textLines, 20, 45);
      }
      
      // Load the image
      try {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = () => {
          // Calculate image dimensions while preserving aspect ratio
          const imgWidth = 180;
          const imgHeight = (img.height * imgWidth) / img.width;
          
          // Add the image to the PDF
          pdf.addImage(img, 'JPEG', 20, 70, imgWidth, imgHeight);
          
          resolve(pdf.output('blob'));
        };
        
        img.onerror = (error) => {
          console.error('Error loading image for PDF:', error);
          // Continue without the image
          resolve(pdf.output('blob'));
        };
        
        img.src = slideData.imageUrl;
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        resolve(pdf.output('blob'));
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};
