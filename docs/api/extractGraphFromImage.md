# extractGraphFromImage

## 描述

`extractGraphFromImage` 函数直接从图像中提取图结构而不保存到文件。

## 参数

- `imagePath`: 输入图像文件的路径
- `distanceThreshold` (可选): 节点连接的距离阈值（默认: 10）
- `maxContainCount` (可选): 图处理的最大包含值（默认: 0）
- `numX` (可选): 在 x 方向生成的节点数（默认: 15）

## 返回值

返回一个 Promise，解析为图数据。

## 示例

```typescript
const graph = await extractGraphFromImage('path/to/image.jpg');
```