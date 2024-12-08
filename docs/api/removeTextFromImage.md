# removeTextFromImage

## 描述

`removeTextFromImage` 函数使用基于 OpenCV 的文本检测从图像中移除文本。

## 参数

- `imagePath`: 输入图像文件的路径
- `outputPath`: 处理后的图像将保存的路径

## 返回值

返回一个 Promise，当文本移除完成时解析。

## 示例

```typescript
await removeTextFromImage('path/to/image.jpg', 'output.jpg');
```