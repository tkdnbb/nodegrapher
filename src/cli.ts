import { extractGraphFromImage } from './utils/extractGraph.js';
import { cv } from 'opencv-wasm';
import { visualizeGraph } from './utils/graphUtils.js';
import * as path from 'path';
import { removeTextFromImage } from './utils/textRemoval.js';
import { processImageToGraph, saveRoad } from './processImage.js';

/** Wait for OpenCV to load */
async function waitForOpenCV(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (cv && Object.keys(cv).length > 0) {
      resolve();
    } else {
      // @ts-expect-error OpenCV runtime initialization
      cv['onRuntimeInitialized'] = (): void => {
        resolve();
      };
    }
  });
}

async function main(): Promise<void> {
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
      let maxContainCount = 0;  // default value
      let numX = 15;  // default value

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
        } else if (remainingArgs[i] === '--num_x' && i + 1 < remainingArgs.length) {
          numX = parseInt(remainingArgs[i + 1], 10);
          i++;
        }
      }

      if (!imagePath) {
        console.error('Usage: npm run visualize -- --image_path <path> [--output_path <path>] [--distance_threshold <number>] [--max_contain <number>] [--num_x <number>]');
        process.exit(1);
      }

      // Extract graph from image and visualize it
      const graph = await extractGraphFromImage(imagePath, distanceThreshold, maxContainCount, numX);
      const visualizedPath = await visualizeGraph(imagePath, graph, outputPath);
      console.log(`Graph visualization saved to: ${visualizedPath}`);
    } else if (command === 'remove-text') {
      // Handle text removal command
      const remainingArgs = args.slice(1);
      let imagePath = '';
      let outputPath = '';

      // Parse command line arguments
      for (let i = 0; i < remainingArgs.length; i++) {
        if (remainingArgs[i] === '--image_path' && i + 1 < remainingArgs.length) {
          imagePath = remainingArgs[i + 1];
          i++;
        } else if (remainingArgs[i] === '--output_path' && i + 1 < remainingArgs.length) {
          outputPath = remainingArgs[i + 1];
          i++;
        }
      }

      if (!imagePath) {
        console.error('Usage: npm run remove-text -- --image_path <path> [--output_path <path>]');
        process.exit(1);
      }

      // If output path is not provided, create one based on input path
      if (!outputPath) {
        const ext = path.extname(imagePath);
        outputPath = imagePath.replace(ext, '_no_text' + ext);
      }

      // Remove text from image
      await removeTextFromImage(imagePath, outputPath);
      console.log(`Text removal complete. Result saved to: ${outputPath}`);
    } else if (command === 'extract-road') {
      // Handle extract-road command
      const remainingArgs = args.slice(1);
      let imagePath = '';
      let outputPath = 'road.json'; // default value
      let maxContainCount = 0;  // default value
      let numX = 15;  // default value

      // Parse command line arguments
      for (let i = 0; i < remainingArgs.length; i++) {
        if (remainingArgs[i] === '--image_path' && i + 1 < remainingArgs.length) {
          imagePath = remainingArgs[i + 1];
          i++;
        } else if (remainingArgs[i] === '--output_path' && i + 1 < remainingArgs.length) {
          outputPath = remainingArgs[i + 1];
          i++;
        } else if (remainingArgs[i] === '--max_contain' && i + 1 < remainingArgs.length) {
          maxContainCount = parseInt(remainingArgs[i + 1], 10);
          i++;
        } else if (remainingArgs[i] === '--num_x' && i + 1 < remainingArgs.length) {
          numX = parseInt(remainingArgs[i + 1], 10);
          i++;
        }
      }

      if (!imagePath) {
        throw new Error('Please provide an image path using --image_path');
      }

      console.log('Extracting road graph...');
      const roadGraph = await saveRoad(imagePath, outputPath, maxContainCount, numX);
      if (roadGraph) {
        console.log('Road graph extraction completed successfully!');
      } else {
        console.log('No road graph could be generated (empty nodesList)');
      }
    } else {
      // Handle extract command (default)
      let imagePath = '';
      let outputPath = '';
      let maxContain = 0;
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
