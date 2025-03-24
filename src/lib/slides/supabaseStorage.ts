
import { supabase } from '../supabase';
import { SlideData } from './types';

/**
 * Ensures the slides storage bucket exists in Supabase
 */
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

/**
 * Saves generated slides to Supabase storage
 */
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

// Initialize slide storage bucket when the module is imported
ensureSlidesBucketExists();
