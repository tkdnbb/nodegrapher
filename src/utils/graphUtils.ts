import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import * as path from 'path';
import * as fs from 'fs';

interface Point2D {
  x: number;
  y: number;
}

interface GraphData {
  nodes: Point2D[];
  lines: [number, number][];
}

/**
 * Draw a circle on the canvas
 */
function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

/**
 * Draw a line on the canvas
 */
function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.closePath();
}

/**
 * Visualize the graph by drawing nodes and edges on the original image and save to a file.
 * 
 * @param imagePath - Path to the original image
 * @param graph - Graph data containing nodes and lines
 * @param outputPath - Optional path to save the output image. If not provided, will save next to input with '_visualized' suffix
 * @returns Path to the saved visualization
 */
export async function visualizeGraph(
  imagePath: string,
  graph: GraphData,
  outputPath?: string
): Promise<string> {
  // Load the original image
  const image = await loadImage(imagePath);
  
  // Create canvas with image dimensions
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  
  // Draw the original image
  ctx.drawImage(image, 0, 0);

  // Draw edges as blue lines
  for (const [startIdx, endIdx] of graph.lines) {
    const start = graph.nodes[startIdx];
    const end = graph.nodes[endIdx];
    drawLine(
      ctx,
      Math.round(start.x),
      Math.round(start.y),
      Math.round(end.x),
      Math.round(end.y),
      'blue',
      2
    );
  }

  // Draw nodes as green circles
  for (const node of graph.nodes) {
    drawCircle(
      ctx,
      Math.round(node.x),
      Math.round(node.y),
      5,
      'green'
    );
  }

  // Determine output path
  const finalOutputPath = outputPath || ((): string => {
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const basename = path.basename(imagePath, ext);
    return path.join(dir, `${basename}_visualized${ext}`);
  })();

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(finalOutputPath, buffer);

  return finalOutputPath;
}
