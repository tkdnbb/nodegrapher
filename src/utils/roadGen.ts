import { Point2D } from './types.js';

/**
 * Add equally spaced nodes within the bounds of the existing nodes.
 * 
 * @param nodesList List of existing nodes
 * @param numX Number of nodes in the x direction
 * @param numY Optional number of nodes in the y direction. If not provided, defaults to numX
 * @returns List of new nodes added within the bounds
 * @throws Error if there's not enough space or invalid parameters
 */
export function genNodes(
  nodesList: Point2D[],
  numX: number,
  numY: number = numX
): Point2D[] {
  // Step 1: Find the bounds of the existing nodes
  const xCoords = nodesList.map(node => node.x);
  const yCoords = nodesList.map(node => node.y);
  const delta = 7;
  
  const minX = Math.min(...xCoords) + delta;
  const maxX = Math.max(...xCoords) - delta;
  const minY = Math.min(...yCoords) + delta;
  const maxY = Math.max(...yCoords) - delta;

  // Ensure there is space to add new nodes
  if (minX >= maxX || minY >= maxY) {
    throw new Error(
      'Not enough space to add new nodes. Check the bounds of the existing nodes.'
    );
  }

  // Step 2: Validate input parameters
  if (numX <= 0 || numY <= 0) {
    throw new Error('numX and numY must be positive integers.');
  }

  // Calculate the range in x and y directions
  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  // Step 3: Generate equally spaced nodes
  const newNodes: Point2D[] = [];
  const stepX = numX > 1 ? rangeX / (numX - 1) : rangeX;
  const stepY = numY > 1 ? rangeY / (numY - 1) : rangeY;

  for (let i = 0; i < numX; i++) {
    for (let j = 0; j < numY; j++) {
      const newX = minX + i * stepX;
      const newY = minY + j * stepY;
      newNodes.push({
        x: Number(newX.toFixed(2)),
        y: Number(newY.toFixed(2))
      });
    }
  }

  return newNodes;
}
