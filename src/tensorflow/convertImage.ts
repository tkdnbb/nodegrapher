import * as tf from '@tensorflow/tfjs-node';
import {
  loadImageTensor,
  createGraphFromImage,
  GraphNeuralNetwork,
  disposeGraph,
  getGraphStats
} from '../utils/imageGraph.js';

async function main(): Promise<void> {
  try {
    // Validate command line arguments
    if (process.argv.length < 3) {
      console.error('Usage: ts-node convertImage.ts <image_path>');
      process.exit(1);
    }

    const imagePath = process.argv[2];

    // Load and process image
    console.log('Loading image...');
    const imageTensor = await loadImageTensor(imagePath);
    console.log('Image dimensions:', {
      width: imageTensor.width,
      height: imageTensor.height,
      channels: imageTensor.channels
    });

    // Convert to graph
    console.log('Converting to graph...');
    const graph = createGraphFromImage(imageTensor);
    const stats = getGraphStats(graph);
    console.log('Graph statistics:', stats);

    // Initialize neural network
    console.log('Creating neural network...');
    const model = new GraphNeuralNetwork(
      stats.features,  // Input: RGB values
      16,             // Hidden layer size
      10              // Output classes
    );

    // Forward pass
    console.log('Running forward pass...');
    const output = model.forward(graph);
    console.log('Output shape:', output.shape);

    // Clean up resources
    tf.tidy(() => {
      imageTensor.tensor.dispose();
      disposeGraph(graph);
      model.dispose();
      output.dispose();
    });

    console.log('Processing complete!');

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});