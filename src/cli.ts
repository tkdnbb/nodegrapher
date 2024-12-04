import { extractGraphFromImage, processImageToGraph } from './utils/extractGraph.js';
import { cv } from 'opencv-wasm'
import { visualizeGraph } from './utils/graphUtils.js';

/** Wait for OpenCV to load */
async function waitForOpenCV(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (cv && Object.keys(cv).length > 0) {
      resolve();
    }
  });
}

async function main() {
  try {
    await waitForOpenCV();
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'visualize') {
      // Handle visualization command
      const remainingArgs = args.slice(1);
      let imagePath = '';
      let outputPath = '';
      let distanceThreshold = 10; // default value
      let maxContainCount = 1;  // default value

      // Parse command line arguments
      for (let i = 0; i < remainingArgs.length; i++) {
        if (remainingArgs[i] === '--image_path' && i + 1 < remainingArgs.length) {
          imagePath = remainingArgs[i + 1];
          i++;
        } else if (remainingArgs[i] === '--output_path' && i + 1 < remainingArgs.length) {
          outputPath = remainingArgs[i + 1];
          i++;
        } else if (remainingArgs[i] === '--distance_threshold' && i + 1 < remainingArgs.length) {
          distanceThreshold = parseInt(remainingArgs[i + 1], 10);
          i++;
        } else if (remainingArgs[i] === '--max_contain' && i + 1 < remainingArgs.length) {
          maxContainCount = parseInt(remainingArgs[i + 1], 10);
          i++;
        }
      }

      if (!imagePath) {
        console.error('Usage: npm run visualize -- --image_path <path> [--output_path <path>] [--distance_threshold <number>] [--max_contain <number>]');
        process.exit(1);
      }

      // Extract graph from image and visualize it
      const graph = await extractGraphFromImage(imagePath, distanceThreshold, maxContainCount);
      const visualizedPath = await visualizeGraph(imagePath, graph, outputPath);
      console.log(`Graph visualization saved to: ${visualizedPath}`);
    } else {
      // Handle extract command (default)
      let imagePath = '';
      let outputPath = '';
      let maxContain = 1;
      let numX = 15;  // default value

      // Parse command line arguments
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--image_path' && i + 1 < args.length) {
          imagePath = args[i + 1];
          i++;
        } else if (args[i] === '--output_path' && i + 1 < args.length) {
          outputPath = args[i + 1];
          i++;
        } else if (args[i] === '--max_contain' && i + 1 < args.length) {
          maxContain = parseInt(args[i + 1], 10);
          i++;
        } else if (args[i] === '--num_x' && i + 1 < args.length) {
          numX = parseInt(args[i + 1], 10);
          i++;
        }
      }

      // Check required arguments
      if (!imagePath || !outputPath) {
        console.error('Usage: npm run extract -- --image_path <path> --output_path <path> [--max_contain <number>] [--num_x <number>]');
        process.exit(1);
      }

      await processImageToGraph(imagePath, outputPath, maxContain, numX);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
