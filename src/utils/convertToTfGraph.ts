import * as tf from '@tensorflow/tfjs-node';

interface Point2D {
  x: number;
  y: number;
}

interface GraphData {
  nodes: Point2D[];
  lines: [number, number][];
}

interface TfGraphData {
  nodeFeatures: tf.Tensor2D;  // Node coordinates tensor
  edgeIndices: tf.Tensor2D;   // Edge indices tensor
}

/**
 * Convert graph data to TensorFlow.js format (analogous to PyTorch Geometric)
 * 
 * @param graph Graph data with nodes and edges
 * @returns TensorFlow.js tensors representing the graph
 */
export function convertToTfGraph(graph: GraphData): TfGraphData {
  // Convert nodes to tensor
  const nodeCoords = graph.nodes.map(node => [node.x, node.y]);
  const nodeFeatures = tf.tensor2d(nodeCoords, [nodeCoords.length, 2], 'float32');

  // Convert edges to tensor (transpose for same format as PyG)
  const edges = graph.lines;
  const edgeIndices = tf.tensor2d(edges, [edges.length, 2], 'int32').transpose() as tf.Tensor2D;

  return {
    nodeFeatures,
    edgeIndices
  };
}

/**
 * Clean up tensors to prevent memory leaks
 * 
 * @param tfGraph TensorFlow.js graph data
 */
export function disposeTfGraph(tfGraph: TfGraphData): void {
  tfGraph.nodeFeatures.dispose();
  tfGraph.edgeIndices.dispose();
}

/**
 * Get graph statistics
 * 
 * @param tfGraph TensorFlow.js graph data
 * @returns Object containing graph statistics
 */
export function getTfGraphStats(tfGraph: TfGraphData): {
  numNodes: number;
  numEdges: number;
  avgDegree: number;
} {
  const numNodes = tfGraph.nodeFeatures.shape[0];
  const numEdges = tfGraph.edgeIndices.shape[1];
  const avgDegree = (numEdges * 2) / numNodes;  // *2 because edges are undirected

  return {
    numNodes,
    numEdges,
    avgDegree
  };
}

/**
 * Convert TensorFlow.js graph back to regular GraphData format
 * 
 * @param tfGraph TensorFlow.js graph data
 * @returns Regular graph data format
 */
export async function tfGraphToRegular(tfGraph: TfGraphData): Promise<GraphData> {
  // Convert node features back to array
  const nodeArray = await tfGraph.nodeFeatures.array() as number[][];
  const nodes = nodeArray.map(([x, y]) => ({ x, y }));

  // Convert edge indices back to array and transpose back
  const edgeArray = await tfGraph.edgeIndices.transpose().array() as number[][];
  const lines = edgeArray as [number, number][];

  return {
    nodes,
    lines
  };
}
