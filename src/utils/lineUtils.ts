interface Point2D {
  x: number;
  y: number;
}

type Line = [number, number];

/**
 * Generate lines connecting vertically and horizontally adjacent nodes.
 * 
 * @param nodesList - List of nodes, e.g., [{"x": 1, "y": 1}, {"x": 2, "y": 1}, ...].
 * @returns List of line connections, where each connection is a pair of indices (e.g., [[0, 1], [1, 2], ...]).
 */
export function genLines(nodesList: Point2D[]): Line[] {
  // Step 1: Group nodes by x and y values
  const xGroups = new Map<number, number[]>();  // Group indices by x value
  const yGroups = new Map<number, number[]>();  // Group indices by y value

  // Group nodes by their x and y coordinates
  nodesList.forEach((node, index) => {
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

  // Step 2: Generate connections
  const lines: Line[] = [];

  // Connect nodes with the same x value (vertical connections)
  for (const group of xGroups.values()) {
    for (let i = 0; i < group.length - 1; i++) {
      lines.push([group[i], group[i + 1]]);
    }
  }

  // Connect nodes with the same y value (horizontal connections)
  for (const group of yGroups.values()) {
    for (let i = 0; i < group.length - 1; i++) {
      lines.push([group[i], group[i + 1]]);
    }
  }

  return lines;
}
