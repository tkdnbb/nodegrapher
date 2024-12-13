import { isPointEnclosedByEdges } from './geometryUtils.js';

export interface Point2D {
  x: number;
  y: number;
}

export type Edge = [number, number];
export type Line = [[number, number, number, number]]; // [[x1, y1, x2, y2]]

/**
 * Filter out new nodes that are enclosed by any polygons formed by edges_list.
 * 
 * @param newNodes - List of new nodes, e.g., [{"x": 2, "y": 2}, ...].
 * @param nodesList - List of existing nodes.
 * @param edgesList - List of edges as pairs of node indices.
 * @param maxContainCount - Maximum number of polygons that can contain the point (default: 0)
 * @returns Filtered list of new nodes.
 */
export function filterRoadNodes(
  newNodes: Point2D[],
  nodesList: Point2D[],
  edgesList: Edge[],
  maxContainCount = 0
): Point2D[] {
  const filteredNodes: Point2D[] = [];

  for (const node of newNodes) {
    const { x, y } = node;
    if (!isPointEnclosedByEdges({ x, y }, nodesList, edgesList, maxContainCount)) {
      filteredNodes.push(node);
    }
  }

  return filteredNodes;
}

/**
 * Remove duplicate or near-parallel lines based on distance and angle thresholds.
 * 
 * @param lines - Detected lines from HoughLinesP.
 * @param distanceThreshold - Distance threshold to consider lines as duplicates.
 * @param angleThreshold - Angle threshold (in radians) to consider lines as parallel.
 * @returns Filtered list of lines.
 */
export function deduplicateLines(
  lines: Line[],
  distanceThreshold = 5,
  angleThreshold = Math.PI / 72  // 2.5 degrees
): Line[] {
  const filteredLines: Line[] = [];

  for (let i = 0; i < lines.length; i++) {
    const [x1, y1, x2, y2] = lines[i][0];
    let keepLine = true;

    // Calculate line properties
    const length1 = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const midpoint1 = [(x1 + x2) / 2, (y1 + y2) / 2];
    const isVertical1 = Math.abs(x2 - x1) < distanceThreshold;
    const isHorizontal1 = Math.abs(y2 - y1) < distanceThreshold;

    for (const line2 of filteredLines) {
      const [x3, y3, x4, y4] = line2[0];

      // Check for exact overlap first (endpoints match within threshold)
      const endpointsMatch = (
        (Math.abs(x1 - x3) < 1 && Math.abs(y1 - y3) < 1 &&
         Math.abs(x2 - x4) < 1 && Math.abs(y2 - y4) < 1) ||
        (Math.abs(x1 - x4) < 1 && Math.abs(y1 - y4) < 1 &&
         Math.abs(x2 - x3) < 1 && Math.abs(y2 - y3) < 1)
      );

      if (endpointsMatch) {
        keepLine = false;
        break;
      }

      // Calculate second line properties
      const length2 = Math.sqrt((x4 - x3) ** 2 + (y4 - y3) ** 2);
      const midpoint2 = [(x3 + x4) / 2, (y3 + y4) / 2];
      const isVertical2 = Math.abs(x4 - x3) < distanceThreshold;
      const isHorizontal2 = Math.abs(y4 - y3) < distanceThreshold;

      // Calculate midpoint distance
      const midpointDist = Math.sqrt(
        (midpoint1[0] - midpoint2[0]) ** 2 + 
        (midpoint1[1] - midpoint2[1]) ** 2
      );

      // Compute angles of the two lines
      const angle1 = Math.atan2(y2 - y1, x2 - x1);
      const angle2 = Math.atan2(y4 - y3, x4 - x3);
      const angleDiff = Math.abs(angle1 - angle2);

      // Normalize angle difference to [0, PI/2]
      const normalizedAngleDiff = Math.min(
        angleDiff,
        Math.PI - angleDiff
      );

      // Check if lines have same orientation (both vertical or both horizontal)
      const sameOrientation = (isVertical1 && isVertical2) || (isHorizontal1 && isHorizontal2);

      // Check if lines are similar:
      // 1. Similar angles (parallel or anti-parallel)
      // 2. Close midpoints
      // 3. Similar lengths
      // 4. Same orientation (both vertical or both horizontal)
      const lengthRatio = Math.max(length1, length2) / Math.min(length1, length2);
      if (normalizedAngleDiff < angleThreshold && 
          midpointDist < distanceThreshold &&
          lengthRatio < 1.2 &&  // Allow 20% length difference
          sameOrientation) {
        keepLine = false;
        break;
      }
    }

    if (keepLine) {
      filteredLines.push(lines[i]);
    }
  }

  return filteredLines;
}
