
import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import { supabase } from './supabase';

export interface SlideData {
  imageUrl: string;
  extractedText: string;
  title?: string;
}

// Generate PowerPoint presentation
export const generatePptx = async (slideData: SlideData): Promise<Blob> => {
  const pptx = new pptxgen();
  
  // Add a title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText(slideData.title || "Whiteboard to Slides", {
    x: 1,
    y: 1,
    w: 8,
    h: 1,
    fontSize: 24,
    bold: true,
    color: "363636",
  });
  titleSlide.addText("Automatically generated from whiteboard image", {
    x: 1,
    y: 2,
    fontSize: 14,
    color: "666666",
  });

  // Add content slide with image
  const contentSlide = pptx.addSlide();
  
  // Add the extracted text to the slide
  if (slideData.extractedText && slideData.extractedText.trim()) {
    contentSlide.addText(slideData.extractedText, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 2,
      fontSize: 14,
      color: "363636",
    });
  }
  
  // Add the image to the slide
  try {
    // For remote images, we need to fetch them first
    const response = await fetch(slideData.imageUrl);
    const blob = await response.blob();
    const imageBuffer = await blob.arrayBuffer();
    
    contentSlide.addImage({
      data: Buffer.from(imageBuffer), // Convert ArrayBuffer to Buffer
      x: 1,
      y: 2.5,
      w: 8,
      h: 4,
    });
  } catch (error) {
    console.error('Error adding image to slide:', error);
  }

  // Generate and return the PPTX as a Blob
  // Use the correct method for pptxgenjs v3.x
  return await pptx.writeFile({ fileName: 'slide.pptx' }) as unknown as Blob;
};

// Generate PDF document
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

// Save generated slide to Supabase
export const saveSlideToSupabase = async (
  slideData: SlideData,
  pptxBlob: Blob,
  pdfBlob: Blob
): Promise<{ pptxUrl: string; pdfUrl: string }> => {
  try {
    // Create unique filenames
    const timestamp = Date.now();
    const baseFileName = `slide_${timestamp}`;
    
    // Upload PPTX
    const pptxPath = `${baseFileName}.pptx`;
    const { error: pptxError } = await supabase.storage
      .from('whiteboard-slides')
      .upload(pptxPath, pptxBlob, {
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        upsert: false
      });
    
    if (pptxError) throw pptxError;
    
    // Upload PDF
    const pdfPath = `${baseFileName}.pdf`;
    const { error: pdfError } = await supabase.storage
      .from('whiteboard-slides')
      .upload(pdfPath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (pdfError) throw pdfError;
    
    // Get public URLs
    const { data: { publicUrl: pptxUrl } } = supabase.storage
      .from('whiteboard-slides')
      .getPublicUrl(pptxPath);
    
    const { data: { publicUrl: pdfUrl } } = supabase.storage
      .from('whiteboard-slides')
      .getPublicUrl(pdfPath);
    
    // Store the record in the database
    const { error: dbError } = await supabase
      .from('slide_exports')
      .insert([{
        image_url: slideData.imageUrl,
        extracted_text: slideData.extractedText,
        pptx_url: pptxUrl,
        pdf_url: pdfUrl,
        created_at: new Date().toISOString()
      }]);
    
    if (dbError) {
      console.error('Error storing slide record:', dbError);
      // We continue anyway since the files are already stored
    }
    
    return { pptxUrl, pdfUrl };
  } catch (error) {
    console.error('Error saving slides to Supabase:', error);
    throw error;
  }
};

// Initialize slide storage bucket
export const ensureSlidesBucketExists = async () => {
  try {
    // Check if the slides bucket exists
    const { data, error } = await supabase.storage.getBucket('whiteboard-slides');
    
    // If bucket doesn't exist, create it
    if (error && error.message.includes('not found')) {
      await supabase.storage.createBucket('whiteboard-slides', {
        public: true
      });
      console.log('Created "whiteboard-slides" bucket');
    }
  } catch (error) {
    console.error('Error ensuring slides bucket exists:', error);
  }
};

// Ensure the bucket exists when the module is imported
ensureSlidesBucketExists();
