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
  1  // maxContainCount: controls the maximum containment count for graph processing
);

// To visualize a graph from an image
import { extractGraphFromImage, visualizeGraph } from 'nodegrapher';

const graph = await extractGraphFromImage('path/to/image.jpg', 10, 1);
await visualizeGraph('path/to/image.jpg', graph, 'visualization.jpg');
```

### CLI Usage

The package provides two main CLI commands:

1. Extract graph data from an image:
```bash
npm run extract -- --image_path img/example.jpg --output_path graph.json [--max_contain <number>] [--num_x <number>]
```

2. Visualize graph structure from an image:
```bash
npm run visualize -- --image_path img/example.jpg [--output_path visualization.jpg] [--distance_threshold <number>] [--max_contain <number>]
```

**Extract Command Arguments:**
- `--image_path`: Path to the input image file
- `--output_path`: Path where the output JSON file will be saved
- `--max_contain` (optional): Maximum containment value for graph processing (default: 1)
- `--num_x` (optional): Number of nodes to generate in the x direction for the road graph (default: 15)

**Visualize Command Arguments:**
- `--image_path`: Path to the input image file
- `--output_path` (optional): Path where the visualization will be saved. If not provided, saves next to input with '_visualized' suffix
- `--distance_threshold` (optional): Distance threshold for node connections (default: 10)
- `--max_contain` (optional): Maximum containment value for graph processing (default: 1)

### API Reference

#### processImageToGraph(imagePath, outputPath, maxContainCount?, numX?)

Processes an image and extracts graph data from it.

**Parameters:**
- `imagePath` (string): Path to the input image file
- `outputPath` (string): Path where the output JSON file will be saved
- `maxContainCount` (number, optional): Maximum containment value for graph processing. Defaults to 1
- `numX` (number, optional): Number of nodes to generate in the x direction for the road graph. Defaults to 15

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