import { Edge } from './filters.js';
import { standardizePolygon } from './geometryUtils.js';
import { isPointEnclosedByEdges } from './geometryUtils.js';

describe.skip('standardizePolygon', () => {
  it('should handle basic polygon rotations', () => {
    // Test different rotations of the same polygon
    const polygon1 = [0, 1, 2, 3];
    const polygon2 = [1, 2, 3, 0];
    const polygon3 = [2, 3, 0, 1];
    const polygon4 = [3, 0, 1, 2];

    const expected = [0, 1, 2, 3];

    expect(standardizePolygon(polygon1)).toEqual(expected);
    expect(standardizePolygon(polygon2)).toEqual(expected);
    expect(standardizePolygon(polygon3)).toEqual(expected);
    expect(standardizePolygon(polygon4)).toEqual(expected);
  });

  it('should handle polygon reflections', () => {
    // Test different reflections of the same polygon
    const polygon1 = [3, 2, 1, 0];
    const polygon2 = [0, 3, 2, 1];
    const polygon3 = [1, 0, 3, 2];
    const polygon4 = [2, 1, 0, 3];

    const expected = [0, 1, 2, 3];

    expect(standardizePolygon(polygon1)).toEqual(expected);
    expect(standardizePolygon(polygon2)).toEqual(expected);
    expect(standardizePolygon(polygon3)).toEqual(expected);
    expect(standardizePolygon(polygon4)).toEqual(expected);
  });

  it('should handle irregular polygons', () => {
    // Test polygons with non-sequential vertex indices
    const polygon1 = [5, 2, 8, 1];
    const polygon2 = [1, 5, 2, 8];
    const polygon3 = [8, 1, 5, 2];

    // The smallest rotation of [5, 2, 8, 1] should be [1, 5, 2, 8]
    const expected = [1, 5, 2, 8];

    expect(standardizePolygon(polygon1)).toEqual(expected);
    expect(standardizePolygon(polygon2)).toEqual(expected);
    expect(standardizePolygon(polygon3)).toEqual(expected);
  });

  it('should handle polygons with repeated indices', () => {
    // Test polygons with some repeated vertex indices
    const polygon1 = [1, 1, 2, 3];
    const polygon2 = [3, 1, 1, 2];
    const polygon3 = [2, 3, 1, 1];

    const expected = [1, 1, 2, 3];

    expect(standardizePolygon(polygon1)).toEqual(expected);
    expect(standardizePolygon(polygon2)).toEqual(expected);
    expect(standardizePolygon(polygon3)).toEqual(expected);
  });

  it('should handle edge cases', () => {
    // Test empty polygon
    expect(standardizePolygon([])).toEqual([]);

    // Test single vertex polygon
    expect(standardizePolygon([1])).toEqual([1]);

    // Test two vertex polygon
    expect(standardizePolygon([2, 1])).toEqual([1, 2]);

    // Test polygon with all same indices
    expect(standardizePolygon([1, 1, 1, 1])).toEqual([1, 1, 1, 1]);
  });
});

describe('isPointEnclosedByEdges', () => {
  it('should detect point inside a simple square', () => {
    const point = { x: 1.5, y: 1.5 };
    const nodes = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 }
    ];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0]] as Edge[];
    
    expect(isPointEnclosedByEdges(point, nodes, edges)).toBe(true);
  });

  it('should detect point outside a simple square', () => {
    const point = { x: 0.5, y: 0.5 };
    const nodes = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 }
    ];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0]] as Edge[];
    
    expect(isPointEnclosedByEdges(point, nodes, edges)).toBe(false);
  });

  it('should handle point on the edge', () => {
    const point = { x: 1.5, y: 1 };
    const nodes = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 }
    ];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0]] as Edge[];
    
    expect(isPointEnclosedByEdges(point, nodes, edges)).toBe(true);
  });

  it('should handle point with multiple polygons', () => {
    const point = { x: 1.5, y: 1.5 };
    const nodes = [
      { x: 1, y: 1 }, // First square
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 3, y: 1 }, // Second square
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 3, y: 2 }
    ];
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // First square
      [4, 5], [5, 6], [6, 7], [7, 4]  // Second square
    ] as Edge[];
    
    expect(isPointEnclosedByEdges(point, nodes, edges)).toBe(true);
  });

  it('should handle empty inputs', () => {
    const point = { x: 1, y: 1 };
    expect(isPointEnclosedByEdges(point, [], [])).toBe(false);
  });

  it.skip('should handle complex polygon', () => {
    const point = { x: 2, y: 2 };
    const nodes = [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 2, y: 2 },
      { x: 1, y: 3 }
    ];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] as Edge[];
    
    expect(isPointEnclosedByEdges(point, nodes, edges)).toBe(true);
  });
});
