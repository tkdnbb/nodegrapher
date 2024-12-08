# saveRoad

## 描述

`saveRoad` 函数根据提供的图像生成并保存道路图。

## 参数

- `imagePath`: 输入图像文件的路径
- `outputPath` (可选): 道路图将保存为 JSON 的路径（默认: "road.json"）
- `maxContainCount` (可选): 图处理的最大包含值（默认: 1）
- `numX` (可选): 在 x 方向生成的节点数（默认: 15）

## 返回值

返回一个 Promise，解析为道路图数据，或在无法生成道路图时解析为 undefined。

## 示例

```typescript
const roadGraph = await saveRoad('path/to/image.jpg', 'road.json');
```