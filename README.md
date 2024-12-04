# nodegrapher

A TypeScript/Node.js package for transforming images into spatial graph data. This package provides utilities to extract graph structures from images, making it useful for various applications such as network analysis, path planning, and spatial data processing.

## Installation

```bash
npm install nodegrapher
```

## Features

- Extract graph structures from images
- Generate road-like graph networks
- Optional graph visualization
- TypeScript support
- Flexible output formats

## Usage

### Basic Usage

```typescript
import { processImageToGraph } from 'nodegrapher';

// Process an image and get graph data
const graphData = await processImageToGraph(
  'path/to/image.jpg',
  'output.json',
  1,  // maxContainCount: controls the maximum containment count for graph processing
  true // visualize: enables graph visualization
);
```

### CLI Usage

The package provides two main CLI commands:

1. Extract graph data from an image:
```bash
npm run extract -- --image_path img/example.jpg --output_path graph.json [--visualize] [--max_contain <number>]
```

2. Visualize graph structure from an image:
```bash
npm run visualize -- --image_path img/example.jpg [--output_path visualization.jpg]
```

**Extract Command Arguments:**
- `--image_path`: Path to the input image file
- `--output_path`: Path where the output JSON file will be saved
- `--visualize` (optional): Enable graph visualization
- `--max_contain` (optional): Maximum containment value for graph processing (default: 1)

**Visualize Command Arguments:**
- `--image_path`: Path to the input image file
- `--output_path` (optional): Path where the visualization will be saved. If not provided, saves next to input with '_visualized' suffix

### API Reference

#### processImageToGraph(imagePath, outputPath, maxContainCount?, visualize?)

Processes an image and extracts graph data from it.

**Parameters:**
- `imagePath` (string): Path to the input image file
- `outputPath` (string): Path where the output JSON file will be saved
- `maxContainCount` (number, optional): Maximum containment value for graph processing
- `visualize` (boolean, optional): Whether to visualize the extracted graph. Defaults to false

**Returns:**
- Promise<GraphData | undefined>: Returns a promise that resolves to the graph data or undefined if processing fails

**GraphData Structure:**
```typescript
interface GraphData {
  nodes: Node[];
  lines: Line[];
  nodesList?: Node[][];
}
```

## Development

To set up the development environment:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Run linter: `npm run lint`

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.