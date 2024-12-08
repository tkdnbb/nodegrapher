---
sidebar_position: 2
---

# Installation

Getting started with NodeGrapher is straightforward. Follow these steps to install and set up the package in your project.

## Prerequisites

Before installing NodeGrapher, make sure you have:

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installing NodeGrapher

You can install NodeGrapher using npm:

```bash
npm install nodegrapher
```

Or if you prefer using yarn:

```bash
yarn add nodegrapher
```

## Verifying Installation

To verify that NodeGrapher is installed correctly, you can create a simple test script:

```typescript
import { extractGraphFromImage } from 'nodegrapher';

async function test() {
  try {
    // This will initialize OpenCV and verify the installation
    const graph = await extractGraphFromImage('test-image.jpg');
    console.log('NodeGrapher is installed successfully!');
  } catch (error) {
    console.error('Installation verification failed:', error);
  }
}

test();
```

## Dependencies

NodeGrapher uses several dependencies that are automatically installed:

- **opencv-wasm**: For image processing
- **TypeScript**: For type definitions and compilation
- Other utility packages for graph processing

These dependencies are managed automatically by npm/yarn, so you don't need to install them separately.
