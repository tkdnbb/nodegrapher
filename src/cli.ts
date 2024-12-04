import { processImageToGraph } from './utils/extractGraph.js';
import { cv } from 'opencv-wasm'

/** Wait for OpenCV to load */
async function waitForOpenCV(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (cv && Object.keys(cv).length > 0) {
      resolve();
    }
  });
}

async function main(): Promise<void> {
  try {
    await waitForOpenCV();
    console.log('OpenCV.js initialized');

    const args = process.argv.slice(2);
    let imagePath = '';
    let outputPath = '';
    let visualize = false;
    let maxContain = 1;

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--image_path' && i + 1 < args.length) {
        imagePath = args[i + 1];
        i++;
      } else if (args[i] === '--output_path' && i + 1 < args.length) {
        outputPath = args[i + 1];
        i++;
      } else if (args[i] === '--visualize') {
        visualize = true;
      } else if (args[i] === '--max_contain' && i + 1 < args.length) {
        maxContain = parseInt(args[i + 1], 10);
        i++;
      }
    }

    // Validate arguments
    if (!imagePath || !outputPath) {
      console.error('Usage: npm run extract -- --image_path <path> --output_path <path> [--visualize] [--max_contain <number>]');
      process.exit(1);
    }

    await processImageToGraph(imagePath, outputPath, maxContain, visualize);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
