import { cv } from 'opencv-wasm';
import { createCanvas, loadImage, ImageData } from 'canvas';
import * as fs from 'fs';
import { waitForOpenCV } from './extractGraph.js';

type OpenCVMat = any;

/**
 * Create ImageData from Mat
 */
function matToImageData(mat: OpenCVMat): ImageData {
  return new ImageData(
    new Uint8ClampedArray(mat.data),
    mat.cols,
    mat.rows
  );
}

/**
 * Remove text from an image using OpenCV
 * @param imagePath Input image path
 * @param outputPath Output image path
 */
export async function removeTextFromImage(imagePath: string, outputPath: string): Promise<void> {
  let mat: OpenCVMat | null = null;
  let gray: OpenCVMat | null = null;
  let thresh: OpenCVMat | null = null;
  let contours: OpenCVMat | null = null;
  let hierarchy: OpenCVMat | null = null;
  let outputImage: OpenCVMat | null = null;

  try {
    // Ensure OpenCV is initialized
    await waitForOpenCV();

    // Load image using canvas
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Convert canvas to cv.Mat
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = Array.from(imageData.data);
    mat = cv.matFromArray(imageData.height, imageData.width, cv.CV_8UC4, data);

    if (!mat) {
      throw new Error('Failed to load image into OpenCV Mat');
    }

    // Create output image copy
    outputImage = mat.clone();

    // Convert to grayscale
    gray = cv.matFromArray(mat.rows, mat.cols, cv.CV_8UC1, new Array(mat.rows * mat.cols).fill(0));
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);

    // Apply adaptive threshold
    thresh = cv.matFromArray(gray.rows, gray.cols, cv.CV_8UC1, new Array(gray.rows * gray.cols).fill(0));
    cv.adaptiveThreshold(
      gray,
      thresh,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      11,  // block size for text
      2    // constant subtracted from mean
    );

    // Dilate to connect text components
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    cv.dilate(thresh, thresh, kernel);
    kernel.delete();

    // Find contours
    contours = new cv.MatVector();
    hierarchy = cv.matFromArray(1, 1, cv.CV_32SC4, [0, 0, 0, 0]);
    cv.findContours(
      thresh,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Process each contour
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const rect = cv.boundingRect(contour);

      // Filter contours based on aspect ratio and area
      const aspectRatio = rect.width / rect.height;
      const area = rect.width * rect.height;
      
      // Text-like regions typically have these characteristics
      if (area > 50 && area < 5000 && aspectRatio < 8 && aspectRatio > 0.1) {
        // Calculate the background color (mean of surrounding area)
        const margin = 2;
        const x1 = Math.max(0, rect.x - margin);
        const y1 = Math.max(0, rect.y - margin);
        const x2 = Math.min(mat.cols, rect.x + rect.width + margin);
        const y2 = Math.min(mat.rows, rect.y + rect.height + margin);

        const bgRect = new cv.Rect(x1, y1, x2 - x1, y2 - y1);
        const bgRegion = mat.roi(bgRect);

        // Calculate mean color
        const meanColor = cv.mean(bgRegion);

        // Fill text area with background color
        cv.rectangle(
          outputImage,
          new cv.Point(x1, y1),
          new cv.Point(x2, y2),
          meanColor,
          -1
        );

        bgRegion.delete();
      }

      contour.delete();
    }

    // Save output image
    const outputImageData = matToImageData(outputImage);
    const outputCanvas = createCanvas(image.width, image.height);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.putImageData(outputImageData, 0, 0);

    // Write to file
    const buffer = outputCanvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`Processing complete. Result saved to: ${outputPath}`);

  } catch (error) {
    throw new Error(`Failed to process image: ${error}`);
  } finally {
    // Clean up OpenCV Mats
    if (mat) mat.delete();
    if (gray && gray !== mat) gray.delete();
    if (thresh) thresh.delete();
    if (contours) contours.delete();
    if (hierarchy) hierarchy.delete();
    if (outputImage && outputImage !== mat) outputImage.delete();
  }
}
