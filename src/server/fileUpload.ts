
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Set up upload directories
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PRODUCT_IMAGES_DIR = path.join(UPLOAD_DIR, 'products');
const COMPANY_LOGOS_DIR = path.join(UPLOAD_DIR, 'company');

// Ensure upload directories exist
export const ensureUploadDirectories = () => {
  // Create main uploads directory if it doesn't exist
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  
  // Create subdirectories
  if (!fs.existsSync(PRODUCT_IMAGES_DIR)) {
    fs.mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(COMPANY_LOGOS_DIR)) {
    fs.mkdirSync(COMPANY_LOGOS_DIR, { recursive: true });
  }
};

/**
 * Save a base64 image to disk
 * @param base64Data Base64 encoded image data (can include data URL prefix)
 * @param directory Directory to save the file in
 * @returns Path to the saved file relative to the public directory
 */
export const saveBase64Image = (base64Data: string, directory: 'products' | 'company'): string => {
  // Remove the data URL prefix if present
  const base64Image = base64Data.split(';base64,').pop();
  if (!base64Image) {
    throw new Error('Invalid image data');
  }
  
  // Determine file extension based on the data URL
  let fileExtension = 'png'; // Default
  if (base64Data.includes('image/jpeg')) {
    fileExtension = 'jpg';
  } else if (base64Data.includes('image/png')) {
    fileExtension = 'png';
  } else if (base64Data.includes('image/gif')) {
    fileExtension = 'gif';
  }
  
  // Generate a unique filename
  const fileName = `${uuidv4()}.${fileExtension}`;
  
  // Determine the save directory
  const saveDir = directory === 'products' ? PRODUCT_IMAGES_DIR : COMPANY_LOGOS_DIR;
  const filePath = path.join(saveDir, fileName);
  
  // Save the file
  fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
  
  // Return the path relative to the public directory
  return `/uploads/${directory}/${fileName}`;
};

/**
 * Handle image upload, supporting both base64 and URLs
 * @param imageData Image data (base64 or URL)
 * @param directory Directory to save the file in
 * @returns Path to the saved file or the original URL
 */
export const handleImageUpload = (imageData: string | undefined, directory: 'products' | 'company'): string => {
  // If no image data, return empty string
  if (!imageData) {
    return '';
  }
  
  // If it's a data URL, save to disk
  if (imageData.startsWith('data:image')) {
    return saveBase64Image(imageData, directory);
  }
  
  // If it's already a URL (and not a data URL), return as is
  return imageData;
};
