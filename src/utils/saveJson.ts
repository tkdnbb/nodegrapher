import * as fs from 'fs';

interface Point2D {
  x: number;
  y: number;
}

interface GraphData {
  nodes: Point2D[];
  lines: [number, number][];
}

/**
 * Save the graph data to a JSON file.
 * 
 * @param data - The graph data containing nodes and their connections
 * @param outputPath - Path to the output JSON file
 */
export function saveJson(data: GraphData, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 4));
}
