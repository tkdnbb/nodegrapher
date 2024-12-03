import * as tf from '@tensorflow/tfjs-node';
import { createCanvas, loadImage as loadNodeImage } from 'canvas';

interface ImageTensor {
  tensor: tf.Tensor3D;
  width: number;
  height: number;
  channels: number;
}

interface GraphData {
  features: tf.Tensor2D;      // Node features tensor [numNodes, numFeatures]
  edges: tf.Tensor2D;         // Edge indices tensor [2, numEdges]
  dimensions: {
    width: number;
    height: number;
    channels: number;
  };
}

/**
 * Load and preprocess an image
 */
export async function loadImageTensor(imagePath: string): Promise<ImageTensor> {
  try {
    const image = await loadNodeImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    
    // Convert to tensor and normalize to [0, 1]
    const tensor = tf.tidy(() => {
      const pixels = tf.browser.fromPixels(imageData);
      return pixels.toFloat().div(255).expandDims(0);
    });

    return {
      tensor: tensor as tf.Tensor3D,
      width: image.width,
      height: image.height,
      channels: 3  // RGB
    };
  } catch (error) {
    throw new Error(`Failed to load image: ${error}`);
  }
}

/**
 * Convert image tensor into a pixel-level graph
 */
export function createGraphFromImage(image: ImageTensor): GraphData {
  const { width, height, channels } = image;
  
  return tf.tidy(() => {
    // Reshape image tensor to [pixels, channels]
    const features = image.tensor.reshape([height * width, channels]);

    // Create edges (4-neighborhood connectivity)
    const edges: number[][] = [];
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const current = i * width + j;
        
        // Add edges to neighboring pixels
        if (i > 0) edges.push([current, (i - 1) * width + j]);      // Top
        if (i < height - 1) edges.push([current, (i + 1) * width + j]); // Bottom
        if (j > 0) edges.push([current, i * width + (j - 1)]);      // Left
        if (j < width - 1) edges.push([current, i * width + (j + 1)]); // Right
      }
    }

    return {
      features: features as tf.Tensor2D,
      edges: tf.tensor2d(edges, [edges.length, 2], 'int32').transpose() as tf.Tensor2D,
      dimensions: { width, height, channels }
    };
  });
}

/**
 * Simple Graph Neural Network implementation
 */
export class GraphNeuralNetwork {
  private layer1: tf.LayersModel;
  private layer2: tf.LayersModel;

  constructor(
    inputFeatures: number,
    hiddenFeatures: number,
    outputFeatures: number
  ) {
    this.layer1 = tf.sequential({
      layers: [
        tf.layers.dense({
          units: hiddenFeatures,
          activation: 'relu',
          inputShape: [inputFeatures]
        })
      ]
    });

    this.layer2 = tf.sequential({
      layers: [
        tf.layers.dense({
          units: outputFeatures,
          activation: 'softmax'
        })
      ]
    });
  }

  forward(graph: GraphData): tf.Tensor2D {
    return tf.tidy(() => {
      let x = this.layer1.predict(graph.features) as tf.Tensor2D;
      x = this.layer2.predict(x) as tf.Tensor2D;
      return tf.logSoftmax(x) as tf.Tensor2D;
    });
  }

  dispose(): void {
    this.layer1.dispose();
    this.layer2.dispose();
  }
}

/**
 * Clean up resources
 */
export function disposeGraph(graph: GraphData): void {
  tf.tidy(() => {
    graph.features.dispose();
    graph.edges.dispose();
  });
}

/**
 * Get graph statistics
 */
export function getGraphStats(graph: GraphData): {
  nodes: number;
  edges: number;
  features: number;
} {
  return tf.tidy(() => {
    return {
      nodes: graph.features.shape[0],
      edges: graph.edges.shape[1],
      features: graph.features.shape[1]
    };
  });
}