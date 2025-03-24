
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pksvdmpdmloyrhlnfihn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrc3ZkbXBkbWxveXJobG5maWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA0ODgsImV4cCI6MjA1ODM4NjQ4OH0.H6zORZy4zGBNoPhPQOHBCenN_5OLWtKNFwSN5uc-azo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create bucket if it doesn't exist
export const ensureBucketExists = async () => {
  try {
    // Check if the bucket exists
    const { data, error } = await supabase.storage.getBucket('whiteboard-images');
    
    // If bucket doesn't exist, create it
    if (error && error.message.includes('not found')) {
      await supabase.storage.createBucket('whiteboard-images', {
        public: true
      });
      console.log('Created "whiteboard-images" bucket');
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
  }
};

// Initialize bucket on app load
ensureBucketExists();
