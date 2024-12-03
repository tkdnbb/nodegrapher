import { findClosedQuadrilaterals } from './findClosedQuadrilaterals.js';
import { standardizePolygon } from './geometryUtils.js';

describe.skip('findClosedQuadrilaterals', () => {
  it('should find a single square polygon', () => {
    const adjList = new Map([
      [0, [1, 3]],
      [1, [0, 2]],
      [2, [1, 3]],
      [3, [0, 2]]
    ]);

    const result = findClosedQuadrilaterals(adjList);
    expect(result.size).toBe(1);
    expect([...result][0]).toEqual([0, 1, 2, 3]);
  });

  it('should handle graphs with no quadrilaterals', () => {
    // Triangle graph
    const adjList = new Map([
      [0, [1, 2]],
      [1, [0, 2]],
      [2, [0, 1]]
    ]);

    const result = findClosedQuadrilaterals(adjList);
    expect(result.size).toBe(0);
  });

  it('should handle empty and single-node graphs', () => {
    // Empty graph
    expect(findClosedQuadrilaterals(new Map()).size).toBe(0);

    // Single node graph
    const singleNode = new Map([[0, []]]);
    expect(findClosedQuadrilaterals(singleNode).size).toBe(0);
  });

  it('should handle disconnected components', () => {
    const adjList = new Map([
      // First square
      [0, [1, 3]],
      [1, [0, 2]],
      [2, [1, 3]],
      [3, [0, 2]],
      // Second square (disconnected)
      [4, [5, 7]],
      [5, [4, 6]],
      [6, [5, 7]],
      [7, [4, 6]]
    ]);

    const result = findClosedQuadrilaterals(adjList);
    expect(result.size).toBe(2);

    // Convert Set to Array and sort for consistent testing
    const sortedPolygons = [...result].map(poly => 
      standardizePolygon(poly)
    ).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

    expect(sortedPolygons).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7]
    ]);
  });
});
