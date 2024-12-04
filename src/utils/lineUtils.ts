import { Point2D } from './types.js';

type Line = [number, number];

/**
 * Calculate the average spacing between consecutive nodes in a sorted array
 */
function getAverageSpacing(values: number[]): number {
  if (values.length < 2) return 0;
  let totalSpacing = 0;
  let spacingCount = 0;
  
  for (let i = 1; i < values.length; i++) {
    const spacing = values[i] - values[i - 1];
    if (spacing > 0) {
      totalSpacing += spacing;
      spacingCount++;
    }
  }
  
  return spacingCount > 0 ? totalSpacing / spacingCount : 0;
}

/**
 * Generate lines connecting vertically and horizontally adjacent nodes.
 * Avoids connecting nodes that are too far apart based on the typical spacing in allNodes.
 * 
 * @param filteredNodes - Filtered nodes, e.g., [{"x": 1, "y": 1}, {"x": 2, "y": 1}, ...].
 * @param allNodes - All nodes, e.g., [{"x": 1, "y": 1}, {"x": 2, "y": 1}, ...].
 * @returns List of line connections, where each connection is a pair of indices (e.g., [[0, 1], [1, 2], ...]).
 */
export function genLines(filteredNodes: Point2D[], allNodes: Point2D[]): Line[] {
  // Step 1: Calculate typical spacing from allNodes
  const allXValues = [...new Set(allNodes.map(n => n.x))].sort((a, b) => a - b);
  const allYValues = [...new Set(allNodes.map(n => n.y))].sort((a, b) => a - b);
  const typicalXSpacing = getAverageSpacing(allXValues);
  const typicalYSpacing = getAverageSpacing(allYValues);
  
  // Use 1.9x the typical spacing as the maximum allowed gap
  const maxXGap = typicalXSpacing * 1.9;
  const maxYGap = typicalYSpacing * 1.9;

  // Step 2: Group nodes by x and y values
  const xGroups = new Map<number, number[]>();  // Group indices by x value
  const yGroups = new Map<number, number[]>();  // Group indices by y value

  // Group nodes by their x and y coordinates
  filteredNodes.forEach((node, index) => {
    // Group by x
    if (!xGroups.has(node.x)) {
      xGroups.set(node.x, []);
    }
    xGroups.get(node.x)!.push(index);

    // Group by y
    if (!yGroups.has(node.y)) {
      yGroups.set(node.y, []);
    }
    yGroups.get(node.y)!.push(index);
  });

  const lines: Line[] = [];

  // Step 3: Connect nodes within the same x value (vertical connections)
  for (const [x, indices] of xGroups) {
    // Sort indices by y value
    indices.sort((a, b) => filteredNodes[a].y - filteredNodes[b].y);
    
    // Connect consecutive nodes if they're not too far apart
    for (let i = 0; i < indices.length - 1; i++) {
      const currentY = filteredNodes[indices[i]].y;
      const nextY = filteredNodes[indices[i + 1]].y;
      
      if (nextY - currentY <= maxYGap) {
        lines.push([indices[i], indices[i + 1]]);
      }
    }
  }

  // Step 4: Connect nodes within the same y value (horizontal connections)
  for (const [y, indices] of yGroups) {
    // Sort indices by x value
    indices.sort((a, b) => filteredNodes[a].x - filteredNodes[b].x);
    
    // Connect consecutive nodes if they're not too far apart
    for (let i = 0; i < indices.length - 1; i++) {
      const currentX = filteredNodes[indices[i]].x;
      const nextX = filteredNodes[indices[i + 1]].x;
      
      if (nextX - currentX <= maxXGap) {
        lines.push([indices[i], indices[i + 1]]);
      }
    }
  }

  return lines;
}
