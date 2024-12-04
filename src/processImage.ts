import { extractGraphFromImage } from './utils/extractGraph.js';
import { genLines } from './utils/lineUtils.js';
import { genNodes } from './utils/roadGen.js';
import { saveJson } from './utils/saveJson.js';
import { filterNewNodes } from './utils/filters.js';

/**
 * Processes an image and extracts graph data from it. This function performs the following steps:
 * 1. Extracts a graph structure from the provided image
 * 2. Saves the graph data to a JSON file
 *
 * @param imagePath Path to the input image file to process
 * @param outputPath Path where the output JSON file will be saved
 * @param maxContainCount Maximum number of polygons that can contain the point (default: 1)
 * @param numX Number of nodes to generate in the x direction for the road graph (default: 15)
 * @returns A promise that resolves to the graph data
 * @throws Error If the image processing fails for any reason
 */
export async function processImageToGraph(
  imagePath: string,
  outputPath: string,
  maxContainCount: number = 1,
  numX: number = 15,
): Promise<any> {
  try {
    const graphData = await extractGraphFromImage(imagePath, 10, maxContainCount, numX);
    delete graphData.nodesList;
    await saveJson(outputPath, graphData);
    return graphData;
  } catch (error) {
    throw new Error(`Failed to process image to graph: ${error}`);
  }
}

/**
 * Generates and saves a road graph based on the provided graph data. This function:
 * 1. Generates new nodes based on the input graph's nodesList
 * 2. Filters the new nodes based on the original graph's structure
 * 3. Generates lines connecting the filtered nodes
 * 4. Saves the resulting road graph to a JSON file
 * 
 * @param imagePath Path to the input image file to process
 * @param outputPath Path where the road graph JSON file will be saved (default: "road.json")
 * @param maxContainCount Maximum number of polygons that can contain the point (default: 1)
 * @param numX Number of nodes to generate in the x direction for the road graph (default: 15)
 * @returns A promise that resolves to the road graph data if successful, or undefined if the node list is empty
 * @throws Error If the road graph generation fails for any reason
 */
export async function saveRoad(
  imagePath: string,
  outputPath: string = 'road.json',
  maxContainCount: number = 1,
  numX: number = 15,
): Promise<any | undefined> {
  try {
    const graphData = await extractGraphFromImage(imagePath, 10, maxContainCount, numX);
    if (!graphData.nodesList) {
      return;
    }

    const newNodes = genNodes(graphData.nodesList, numX);
    const filteredNodes = filterNewNodes(newNodes, graphData.nodesList, graphData.lines, maxContainCount);
    const lines = genLines(filteredNodes, newNodes);

    const roadData = {
      nodes: filteredNodes,
      lines: lines,
    };

    await saveJson(outputPath, roadData);
    return roadData;
  } catch (error) {
    throw new Error(`Failed to generate road graph: ${error}`);
  }
}