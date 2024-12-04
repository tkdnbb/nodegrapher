import * as fs from 'fs';
import { GraphData } from './types.js';

/**
 * Save the graph data to a JSON file.
 * 
 * @param outputPath - Path to the output JSON file
 * @param data - The graph data containing nodes and their connections
 */
export async function saveJson(outputPath: string, data: GraphData): Promise<void> {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFile(outputPath, jsonData, 'utf8', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
