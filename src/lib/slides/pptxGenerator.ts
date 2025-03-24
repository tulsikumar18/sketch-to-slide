
import pptxgen from 'pptxgenjs';
import { SlideData } from './types';
import { arrayBufferToBase64 } from './utils';

/**
 * Generates a PowerPoint presentation from the slide data
 */
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
    
    // Convert ArrayBuffer to base64 string for PPTXGen
    const base64String = arrayBufferToBase64(imageBuffer);
    
    contentSlide.addImage({
      data: `data:image/png;base64,${base64String}`,
      x: 1,
      y: 2.5,
      w: 8,
      h: 4,
    });
  } catch (error) {
    console.error('Error adding image to slide:', error);
  }

  // Generate and return the PPTX as a Blob
  return await pptx.writeFile({ fileName: 'slide.pptx' }) as unknown as Blob;
};
