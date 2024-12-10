# processImageToGraph

## 描述

`processImageToGraph` 函数用于处理图像以提取图结构，并将其保存为 JSON 文件。

## 参数

- `imagePath`: 输入图像文件的路径
- `outputPath`: 图数据将保存为 JSON 的路径
- `maxContainCount` (可选): 图处理的最大包含值（默认: 0）
- `numX` (可选): 在 x 方向生成的节点数（默认: 15）

## 返回值

返回一个 Promise，解析为图数据。

## 示例

```typescript
const graphData = await processImageToGraph('path/to/image.jpg', 'output.json');
```