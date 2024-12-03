import { standardizePolygon } from './geometryUtils.js';

/**
 * Finds all unique closed polygons in an undirected graph represented by an adjacency list.
 * A polygon is considered unique if it has a different standardized representation after
 * accounting for rotations and reflections.
 * 
 * The function looks for closed polygons where:
 * 1. All vertices are connected in a cycle
 * 2. Each vertex is connected to exactly two other vertices in the polygon
 * 3. Different rotations/reflections of the same polygon are considered identical
 * 
 * @param adjList - Map representing the graph's adjacency list where:
 *                 - Keys are vertex indices
 *                 - Values are arrays of adjacent vertex indices
 * @returns A Set of arrays, where each array represents a unique polygon's vertex sequence
 * 
 * @example
 * const adjList = new Map([
 *   [0, [1, 4]],
 *   [1, [0, 2]],
 *   [2, [1, 3]],
 *   [3, [2, 4]],
 *   [4, [3, 0]]
 * ]);
 * findClosedPolygons(adjList);
 * // Returns Set { [0, 1, 2, 3, 4] }
 */
export function findClosedPolygons(adjList: Map<number, number[]>): Set<number[]> {
  const visited = new Set<number>();
  const uniquePolygons = new Set<string>();
  const result = new Set<number[]>();
  
  function isValidPolygon(path: number[]): boolean {
    if (path.length < 3) return false;  // A polygon must have at least 3 vertices
  
    // Check that each vertex is connected to exactly two other vertices in the path
    for (let i = 0; i < path.length; i++) {
      const neighbors = adjList.get(path[i]) || [];
      if (neighbors.length !== 2) return false;
      let connectionCount = 0;
      for (let j = 0; j < path.length; j++) {
        if (i !== j && neighbors.includes(path[j])) {
          connectionCount++;
        }
      }
      if (connectionCount !== 2) return false;
    }
  
    // Check that vertices form a proper cycle (each connected to next and previous)
    for (let i = 0; i < path.length; i++) {
      const current = path[i];
      const next = path[(i + 1) % path.length];
      const neighbors = adjList.get(current) || [];
      if (!neighbors.includes(next)) return false;
    }
  
    return true;
  }
  
  function isValidNeighbor(current: number, neighbor: number, path: number[]): boolean {
    // For the first node, only explore larger indices to avoid duplicates
    if (path.length === 0) return true;

    // For other nodes, only visit unvisited vertices except for closing the cycle
    const neighbors = adjList.get(current) || [];
    return !visited.has(neighbor) && neighbors.includes(neighbor);
  }

  function dfs(current: number, start: number, path: number[]): void {
    const currentNeighbors = adjList.get(current) || [];
      
    // If we can close the polygon and it has at least 3 vertices
    if (path.length > 2 && currentNeighbors.includes(start)) {
      if (isValidPolygon(path)) {
        // Standardize the polygon order
        const standardizedPolygon = standardizePolygon(path);
        const polygonKey = JSON.stringify(standardizedPolygon);
        if (!uniquePolygons.has(polygonKey)) {
          uniquePolygons.add(polygonKey);
          result.add(standardizedPolygon);
        }
      }
      return;
    }
  
    // Continue exploring
    for (const neighbor of currentNeighbors) {
      if (isValidNeighbor(current, neighbor, path)) {
        visited.add(neighbor);
        path.push(neighbor);
        dfs(neighbor, start, path);
        path.pop();
        visited.delete(neighbor);
      }
    }
  }
  
  // Start DFS from each vertex
  for (const [vertex] of adjList) {
    visited.add(vertex);
    dfs(vertex, vertex, [vertex]);
    visited.delete(vertex);
  }
  
  return result;
}