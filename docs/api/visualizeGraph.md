# visualizeGraph

## 描述

`visualizeGraph` 函数在图像上可视化图结构。

## 参数

- `imagePath`: 输入图像文件的路径
- `graph`: 要可视化的图数据
- `outputPath`: 可视化结果将保存的路径

## 返回值

返回一个 Promise，当可视化完成时解析。

## 示例

```typescript
await visualizeGraph('path/to/image.jpg', graphData, 'visualization.jpg');
```
