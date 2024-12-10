import { cv } from 'opencv-wasm';
import { Point2D } from './types.js';
import { mergeClosePoints } from './pointUtils.js';
import { deduplicateLines, Edge, filterRoadNodes, Line } from './filters.js';
import { genNodes } from './roadGen.js';
import { createCanvas, loadImage } from 'canvas';

// Define OpenCV types
type OpenCVMat = any; // opencv-wasm doesn't export type definitions

// Wait for OpenCV to be ready
export async function waitForOpenCV(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (cv && Object.keys(cv).length > 0) {
      resolve();
    }
  });
}

type Point2DTuple = [number, number];

export interface GraphData {
  nodesList?: Point2D[];
  nodes: Point2D[];
  lines: [number, number][];
}

/**
 * Convert Point2D to Point2DTuple
 */
export function toTuple(point: Point2D): Point2DTuple {
  return [point.x, point.y];
}

/**
 * Convert Point2DTuple to Point2D
 */
function fromTuple(point: Point2DTuple): Point2D {
  return { x: point[0], y: point[1] };
}

/**
 * Extract graph nodes and edges from an image, merging close nodes.
 * @param imagePath Path to the input image
 * @param distanceThreshold Minimum distance between nodes to consider them as the same node
 * @param maxContainCount Maximum number of polygons that can contain the point (default: 1)
 * @param numX Number of nodes to generate in the x direction (default: 15)
 * @returns A dictionary containing nodes and edges
 */
export async function extractGraphFromImage(
  imagePath: string,
  distanceThreshold: number = 10,
  maxContainCount = 1,
  numX = 15
): Promise<GraphData> {
  let image: OpenCVMat | null = null;
  let edgesMat: OpenCVMat | null = null;
  const linesMat: OpenCVMat | null = null;
  let gray: OpenCVMat | null = null;
  try {
    // Ensure OpenCV is initialized
    await waitForOpenCV();
    // Step 1: Load the image using canvas
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    // Convert to OpenCV Mat using matFromArray
    const data = Array.from(imageData.data);
    image = cv.matFromArray(imageData.height, imageData.width, cv.CV_8UC4, data);

    if (!image) {
      throw new Error(`Unable to load image at path: ${imagePath}`);
    }

    // Convert to grayscale if needed
    if (image.channels() === 4) {
      gray = cv.matFromArray(image.rows, image.cols, cv.CV_8UC1, new Array(image.rows * image.cols).fill(0));
      cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    } else {
      gray = image;
    }

    // Step 2: Edge detection using Canny
    edgesMat = cv.matFromArray(gray.rows, gray.cols, cv.CV_8UC1, new Array(gray.rows * gray.cols).fill(0));
    cv.Canny(gray, edgesMat, 15, 150);

    // Step 3: Detect lines using Probabilistic Hough Transform
    const houghLines = cv.matFromArray(1, 1, cv.CV_32SC4, [0, 0, 0, 0]);
    cv.HoughLinesP(
      edgesMat,
      houghLines,
      1,
      Math.PI / 180,
      50,  // threshold
      50,  // minLineLength
      10   // maxLineGap
    );

    // Convert lines to format expected by deduplicateLines
    const rawLines: number[][] = [];
    for (let i = 0; i < houghLines.rows; i++) {
      const line = houghLines.data32S;
      rawLines.push([
        line[i * 4],
        line[i * 4 + 1],
        line[i * 4 + 2],
        line[i * 4 + 3]
      ]);
    }

    // Clean up the houghLines Mat
    houghLines.delete();

    // Deduplicate lines
    const uniqueLines = deduplicateLines(rawLines.map(l => [l] as Line));

    // Process deduplicated lines
    const points: Point2DTuple[] = [];
    const lines: [number, number][] = [];
    for (const line of uniqueLines) {
      const [x1, y1, x2, y2] = line[0];
      points.push([x1, y1]);
      points.push([x2, y2]);
      lines.push([points.length - 2, points.length - 1]);
    }

    // Step 5: Merge close points
    const { mergedPoints, pointMapping } = mergeClosePoints(points, distanceThreshold);

    // Step 6: Convert tuples back to Point2D objects and update lines
    const mergedPointsObj = mergedPoints.map(fromTuple);
    const updatedLines = lines.map(([i, j]) => {
      const startPoint = pointMapping.get(points[i].toString());
      const endPoint = pointMapping.get(points[j].toString());
      if (!startPoint || !endPoint) return [i, j];
      return [
        mergedPoints.findIndex(p => p[0] === startPoint[0] && p[1] === startPoint[1]),
        mergedPoints.findIndex(p => p[0] === endPoint[0] && p[1] === endPoint[1])
      ];
    }) as Edge[];

    // Generate new nodes
    const newNodes = genNodes(mergedPointsObj, numX);

    // Step 7: Filter nodes
    const filteredNodes = filterRoadNodes(newNodes, mergedPointsObj, updatedLines, maxContainCount);

    return {
      nodesList: mergedPointsObj,
      nodes: [...mergedPointsObj, ...filteredNodes],
      lines: updatedLines,
    };
  } catch (error) {
    throw new Error(`Failed to process image to graph: ${error}`);
  } finally {
    // Clean up OpenCV Mats
    if (image) image.delete();
    if (gray && gray !== image) gray.delete();
    if (edgesMat) edgesMat.delete();
    if (linesMat) linesMat.delete();
  }
}
