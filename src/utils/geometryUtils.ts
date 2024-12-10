import * as turf from '@turf/turf';
import { findClosedQuadrilaterals } from './findClosedQuadrilaterals.js';

export interface Point2D {
  x: number;
  y: number;
}

export type Edge = [number, number];

/**
 * Standardizes a polygon representation by finding its canonical form.
 * The canonical form is the lexicographically smallest representation among all possible
 * rotations and reflections of the polygon's vertex sequence.
 * 
 * @param polygon - Array of vertex indices representing the polygon
 * @returns The standardized polygon representation as an array of vertex indices
 * 
 * @example
 * // Returns [0, 1, 2, 3] for both inputs:
 * standardizePolygon([1, 2, 3, 0])
 * standardizePolygon([3, 2, 1, 0])
 */
export function standardizePolygon(polygon: number[]): number[] {
  // Handle edge cases
  if (!polygon || polygon.length <= 1) return polygon;
  
  const n = polygon.length;
  // Generate all rotations for the polygon
  const rotations = Array.from({ length: n }, (_, i) => 
    [...polygon.slice(i), ...polygon.slice(0, i)]);
  // Generate all rotations for the reversed polygon
  const reversedRotations = Array.from({ length: n }, (_, i) => {
    const reversed = [...polygon].reverse();
    return [...reversed.slice(i), ...reversed.slice(0, i)];
  });
  
  // Find the rotation that starts with the smallest number
  return [...rotations, ...reversedRotations]
    .sort((a, b) => {
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return a[i] - b[i];
      }
      return 0;
    })[0];
}

/**
 * Check if a point is enclosed by any closed polygons formed by edges_list.
 * 
 * @param pointDict - The point to check, with keys "x" and "y", e.g., {"x": 1, "y": 1}
 * @param nodesList - List of node coordinates, e.g., [{"x": 1, "y": 1}, {"x": 4, "y": 1}, ...]
 * @param edgesList - List of edges as pairs of node indices, e.g., [[0, 1], [1, 2], ...]
 * @param maxContainCount - Maximum number of polygons that can contain the point (default: 0)
 * @returns True if the point is enclosed, False otherwise
 */
export function isPointEnclosedByEdges(
  pointDict: Point2D,
  nodesList: Point2D[],
  edgesList: Edge[],
  maxContainCount: number = 0
): boolean {
  // Extract the x and y coordinates from pointDict
  const { x, y } = pointDict;

  // Step 1: Convert nodesList to a list of [x, y] coordinates
  const nodes: [number, number][] = nodesList.map(node => [node.x, node.y]);

  // Step 2: Build adjacency list from edgesList
  const adjacencyList = new Map<number, number[]>();
  for (const [start, end] of edgesList) {
    if (!adjacencyList.has(start)) adjacencyList.set(start, []);
    if (!adjacencyList.has(end)) adjacencyList.set(end, []);
    adjacencyList.get(start)!.push(end);
    adjacencyList.get(end)!.push(start); // Since the graph is undirected
  }

  // Step 3: Find unique closed polygons using DFS
  const uniquePolygons = findClosedQuadrilaterals(adjacencyList);

  // Step 4: Check if the point is within any polygon
  const point = turf.point([x, y]);
  let containCount = 0;

  for (const polygon of uniquePolygons) {
    // Convert polygon from node indices to coordinates
    const polygonCoords = polygon.map(nodeIndex => nodes[nodeIndex]);
    // Add the first point again to close the polygon
    polygonCoords.push(polygonCoords[0]);
    
    const turfPolygon = turf.polygon([polygonCoords]);
    if (turf.booleanPointInPolygon(point, turfPolygon)) {
      containCount++;
      if (containCount > maxContainCount) {
        return true;
      }
    }
  }

  return false;
}
