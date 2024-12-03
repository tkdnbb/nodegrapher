import { deduplicateLines, Line } from './filters.js';

describe.skip('deduplicateLines', () => {
  it('should remove duplicate and parallel lines', () => {
    // Complex test data with many intersecting and parallel lines
    const testLines: Line[] = [
      [[73, 1143, 73, 73]],
      [[1174, 1144, 1174, 72]],
      [[75, 71, 1166, 71]],
      [[74, 1144, 1169, 1144]],
      [[479, 911, 814, 911]],
      [[819, 1007, 819, 912]],
      [[579, 805, 579, 544]],
      [[454, 805, 454, 548]],
      [[139, 716, 367, 716]],
      [[707, 839, 707, 609]],
      [[473, 1003, 822, 1003]],
      [[895, 491, 895, 246]],
      [[390, 373, 390, 177]],
      [[143, 815, 367, 815]],
      [[1107, 1069, 1107, 838]],
      [[291, 629, 291, 407]],
      [[748, 486, 748, 249]],
      [[1067, 721, 1067, 531]],
      [[174, 629, 174, 407]],
      [[934, 727, 934, 532]],
      [[187, 898, 375, 898]],
      [[897, 1067, 897, 840]],
      [[1042, 335, 1042, 185]],
      [[1040, 342, 1040, 184]], // Nearly identical to previous line
      [[187, 1091, 375, 1091]],
      [[393, 176, 561, 176]],
      [[898, 1069, 1106, 1069]],
      [[375, 1090, 375, 899]],
      [[563, 373, 563, 177]],
      [[899, 837, 1103, 837]],
      [[393, 373, 562, 373]],
      [[1163, 341, 1163, 181]],
      [[186, 1096, 186, 899]],
      [[928, 530, 1071, 530]],
      [[749, 491, 894, 491]],
      [[936, 722, 1063, 722]],
      [[448, 548, 582, 548]],
      [[247, 289, 247, 157]],
      [[1044, 334, 1044, 183]], // Similar to lines 23, 24
      [[1048, 180, 1159, 180]],
      [[158, 295, 158, 161]],
      [[751, 245, 894, 245]],
      [[177, 629, 290, 629]],
      [[457, 805, 578, 805]],
      [[142, 814, 142, 717]],
      [[1039, 341, 1168, 341]],
      [[819, 841, 819, 608]],
      [[713, 607, 814, 607]],
      [[176, 407, 288, 407]],
      [[367, 814, 367, 717]],
      [[152, 156, 246, 156]],
      [[712, 842, 815, 842]],
      [[473, 1002, 473, 912]],
      [[160, 290, 246, 290]],
      [[475, 998, 475, 912]], // Nearly identical to previous line
    ];

    const result = deduplicateLines(testLines);

    // Test for specific cases of deduplication
    const findNearbyLine = (x1: number, y1: number, x2: number, y2: number, tolerance = 5): boolean => {
      return result.some(line => {
        const [actualX1, actualY1, actualX2, actualY2] = line[0];
        return Math.abs(actualX1 - x1) <= tolerance &&
               Math.abs(actualY1 - y1) <= tolerance &&
               Math.abs(actualX2 - x2) <= tolerance &&
               Math.abs(actualY2 - y2) <= tolerance;
      });
    };

    // Test that main structural lines are preserved
    expect(findNearbyLine(73, 1143, 73, 73)).toBe(true);    // Left vertical
    expect(findNearbyLine(1174, 1144, 1174, 72)).toBe(true); // Right vertical
    expect(findNearbyLine(75, 71, 1166, 71)).toBe(true);    // Top horizontal

    // Test that parallel lines are preserved when far apart
    expect(findNearbyLine(174, 629, 174, 407)).toBe(true);  // Left vertical section
    expect(findNearbyLine(291, 629, 291, 407)).toBe(true);  // Right vertical section

    // Test that nearly identical vertical lines are deduplicated
    expect(findNearbyLine(1042, 335, 1042, 185)).toBe(true);   // Keep the first line
    expect(findNearbyLine(1040, 342, 1040, 184)).toBe(false);  // Should be removed as duplicate

    // Test that nearly identical horizontal lines are deduplicated
    expect(findNearbyLine(152, 156, 246, 156)).toBe(true);   // Keep the first line
    expect(findNearbyLine(160, 290, 246, 290)).toBe(true);   // Keep (different y-coordinate)

    // The result should have fewer lines than the input
    expect(result.length).toBeLessThan(testLines.length);
  });

  it('should handle empty input', () => {
    const result = deduplicateLines([]);
    expect(result).toEqual([]);
  });

  it('should handle single line input', () => {
    const singleLine: Line[] = [[[0, 0, 100, 100]]];
    const result = deduplicateLines(singleLine);
    expect(result).toEqual(singleLine);
  });

  it('should deduplicate exactly overlapping lines', () => {
    const lines: Line[] = [
      [[0, 0, 100, 100]],
      [[0, 0, 100, 100]] // Exact duplicate
    ];
    const result = deduplicateLines(lines);
    expect(result.length).toBe(1);
  });
});
