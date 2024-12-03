import * as cv from '@techstark/opencv-js';
import { createWorker } from 'tesseract.js';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';

// Add DOM types for ImageData and Canvas context
declare class ImageData {
  constructor(data: Uint8ClampedArray, width: number, height: number);
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Create ImageData from Mat
 */
function matToImageData(mat: cv.Mat): ImageData {
  return new ImageData(
    new Uint8ClampedArray(mat.data),
    mat.cols,
    mat.rows
  );
}

/**
 * Process image to remove text and fill digit areas with black
 * @param imagePath Input image path
 * @param outputPath Output image path
 */
export async function processImage(imagePath: string, outputPath: string): Promise<void> {
  let mat: cv.Mat | null = null;
  let gray: cv.Mat | null = null;
  let thresh: cv.Mat | null = null;
  let contours: cv.MatVector | null = null;
  let hierarchy: cv.Mat | null = null;
  let outputImage: cv.Mat | null = null;

  try {
    // Initialize Tesseract worker
    const worker = await createWorker('eng+chi_sim+chi_tra+jpn');
    
    // Load image using canvas
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    // Convert canvas to cv.Mat
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    mat = cv.matFromImageData(imageData);
    
    // Create output image copy
    outputImage = mat.clone();
    
    // Convert to grayscale
    gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_BGR2GRAY);
    
    // Apply adaptive threshold
    thresh = new cv.Mat();
    cv.adaptiveThreshold(
      gray,
      thresh,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      15,
      10
    );
    
    // Find contours
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(
      thresh,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );
    
    // Process each contour
    for (let i = 0; i < Number(contours.size()); i++) {
      const contour = contours.get(i);
      const rect = cv.boundingRect(contour) as Rect;
      
      // Filter small or large areas
      const area = rect.width * rect.height;
      if (area < 50 || area > 10000) {
        contour.delete();
        continue;
      }
      
      // Extract ROI
      const roi = gray.roi(rect);
      
      // Convert ROI to canvas for Tesseract
      const roiCanvas = createCanvas(rect.width, rect.height);
      const roiCtx = roiCanvas.getContext('2d');
      const roiImageData = matToImageData(roi);
      roiCtx.putImageData(roiImageData, 0, 0);
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(roiCanvas.toBuffer());
      const cleanText = text.trim();
      
      if (/^\d+$/.test(cleanText)) {
        // Fill digit area with black
        cv.rectangle(
          outputImage!,
          new cv.Point(rect.x, rect.y),
          new cv.Point(rect.x + rect.width, rect.y + rect.height),
          new cv.Scalar(0, 0, 0),
          -1
        );
      } else {
        // Calculate background color
        const margin = 5;
        const x1 = Math.max(0, rect.x - margin);
        const y1 = Math.max(0, rect.y - margin);
        const x2 = Math.min(mat!.cols, rect.x + rect.width + margin);
        const y2 = Math.min(mat!.rows, rect.y + rect.height + margin);
        
        const bgRect = new cv.Rect(x1, y1, x2 - x1, y2 - y1);
        const bgRegion = mat!.roi(bgRect);
        
        // Calculate mean color
        const meanColor = cv.mean(bgRegion);
        
        // Fill text area with background color
        cv.rectangle(
          outputImage!,
          new cv.Point(rect.x, rect.y),
          new cv.Point(rect.x + rect.width, rect.y + rect.height),
          meanColor,
          -1
        );
        
        bgRegion.delete();
      }
      
      roi.delete();
      contour.delete();
    }
    
    // Save output image
    const outputCanvas = createCanvas(image.width, image.height);
    const outputCtx = outputCanvas.getContext('2d');
    const outputImageData = matToImageData(outputImage!);
    outputCtx.putImageData(outputImageData, 0, 0);
    
    // Write to file
    const buffer = outputCanvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    await worker.terminate();
    console.log(`Processing complete. Result saved to: ${outputPath}`);
    
  } catch (error) {
    throw new Error(`Failed to process image: ${error}`);
  } finally {
    // Cleanup OpenCV resources
    mat?.delete();
    gray?.delete();
    thresh?.delete();
    contours?.delete();
    hierarchy?.delete();
    outputImage?.delete();
  }
}
