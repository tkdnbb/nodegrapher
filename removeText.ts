import { processImage } from './src/utils/textRemoval.js';

async function main(): Promise<void> {
  try {
    // Validate command line arguments
    if (process.argv.length < 4) {
      console.error('Usage: ts-node removeText.ts <input_image_path> <output_image_path>');
      process.exit(1);
    }

    const inputPath = process.argv[2];
    const outputPath = process.argv[3];

    console.log('Processing image...');
    console.log(`Input: ${inputPath}`);
    console.log(`Output: ${outputPath}`);

    await processImage(inputPath, outputPath);

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
