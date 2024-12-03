import { standardizePolygon } from './geometryUtils.js';

/**
 * Finds all unique closed quadrilaterals in an undirected graph represented by an adjacency list.
 * A quadrilateral is considered unique if it has a different standardized representation after
 * accounting for rotations and reflections.
 * 
 * The function specifically looks for quadrilaterals (4-sided polygons) where:
 * 1. All vertices are connected in a cycle
 * 2. The polygon is simple (non-self-intersecting)
 * 3. Different rotations/reflections of the same quadrilateral are considered identical
 * 
 * @param adjList - Map representing the graph's adjacency list where:
 *                 - Keys are vertex indices
 *                 - Values are arrays of adjacent vertex indices
 * @returns A Set of arrays, where each array represents a unique quadrilateral's vertex sequence
 * 
 * @example
 * const adjList = new Map([
 *   [0, [1, 3]],
 *   [1, [0, 2]],
 *   [2, [1, 3]],
 *   [3, [0, 2]]
 * ]);
 * findClosedQuadrilaterals(adjList);
 * // Returns Set { [0, 1, 2, 3] }
 */
export function findClosedQuadrilaterals(adjList: Map<number, number[]>): Set<number[]> {
  const visited = new Set<number>();
  const uniquePolygons = new Set<string>();
  const result = new Set<number[]>();
  
  function isValidQuadrilateral(path: number[]): boolean {
    if (path.length !== 4) return false;
  
    // Check that each vertex is connected to exactly two other vertices in the path
    for (let i = 0; i < 4; i++) {
      const neighbors = adjList.get(path[i]) || [];
      let connectionCount = 0;
      for (let j = 0; j < 4; j++) {
        if (i !== j && neighbors.includes(path[j])) {
          connectionCount++;
        }
      }
      if (connectionCount !== 2) return false;
    }
  
    // Check that vertices form a proper cycle (each connected to next and previous)
    for (let i = 0; i < 4; i++) {
      const current = path[i];
      const next = path[(i + 1) % 4];
      const neighbors = adjList.get(current) || [];
      if (!neighbors.includes(next)) return false;
    }
  
    // Check that non-adjacent vertices are not connected (no crossing edges)
    for (let i = 0; i < 4; i++) {
      const current = path[i];
      const opposite = path[(i + 2) % 4];
      const neighbors = adjList.get(current) || [];
      if (neighbors.includes(opposite)) return false;
    }
  
    return true;
  }
  
  function isValidNeighbor(current: number, neighbor: number, path: number[]): boolean {
    // For the first node, only explore larger indices to avoid duplicates
    if (path.length === 0 && neighbor < current) return false;
  
    // For other nodes, check if we can use this neighbor
    // Only allow revisiting the start node when completing the cycle
    if (!visited.has(neighbor) || (neighbor === path[0] && path.length === 3)) {
      const neighbors = adjList.get(current) || [];
      return neighbors.includes(neighbor);
    }
  
    return false;
  }

  function dfs(current: number, start: number, path: number[]): void {
    // If we've built a path of length 4, check if it forms a valid polygon
    if (path.length === 4) {
      // Only accept paths that end at a neighbor of the start node
      const currentNeighbors = adjList.get(current) || [];
      if (currentNeighbors.includes(start) && isValidQuadrilateral(path)) {
        // Standardize the polygon order and convert to string for deduplication
        const standardizedPolygon = standardizePolygon([...path]);
        const polygonKey = JSON.stringify(standardizedPolygon);
        if (!uniquePolygons.has(polygonKey)) {
          uniquePolygons.add(polygonKey);
          result.add(standardizedPolygon);
        }
      }
      return;
    }
  
    // Continue exploring if path length is less than 4
    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      if (isValidNeighbor(current, neighbor, path)) {
        visited.add(neighbor);
        path.push(neighbor);
        dfs(neighbor, start, path);
        path.pop();
        if (path.length === 0) {
          visited.delete(neighbor);
        }
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
