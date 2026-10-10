# Lstar Tools

一个面向开发者的轻量在线工具箱。所有现有工具均在浏览器本地运行，不上传图片、JSON 或其他输入内容。

在线访问：[Lstar Tools](http://tool.lstarr.xyz/)

## 修改站点地址

站点根地址只在 [`src/data/siteConfig.ts`](src/data/siteConfig.ts) 的 `configuredSiteUrl` 中维护。迁移域名或子路径时修改该值并重新构建；Vite 的资源根路径、站内跳转、SEO 元数据、站点地图、robots、llms 文档和 GitHub Pages 的 CNAME 都会同步更新。

## 已实现工具

- [**图片 / Base64 互转**](http://tool.lstarr.xyz/tools/image-base64/)：拖拽或选择图片生成 Base64；也可粘贴带或不带 `data:image/...;base64,` 前缀的内容生成图片。无前缀时默认按 JPG 解析，支持预览大图与下载。
- [**图片坐标框选工具**](http://tool.lstarr.xyz/tools/coordinate-selector/)：上传图片后框选多个矩形区域；支持清除图片后重新上传、全屏标注、滚轮缩放、中键平移、移动与调整矩形、Delete / Backspace 删除，并复制原图像素坐标。每个框可编辑名称，导出项格式为 `{"type":"rect","name":"person","id":"person_1","bbox":[x1,y1,x2,y2]}`。
- [**二维码生成工具**](http://tool.lstarr.xyz/tools/qrcode/)：为文字、网址和公开的图片或视频链接生成并下载 PNG 二维码。二维码无法容纳普通媒体文件，因此媒体需先托管在可公开访问的位置。
- [**颜色取色与转换**](http://tool.lstarr.xyz/tools/color/)：通过系统取色盘或输入代码选择颜色，实时同步 HEX、RGB、HSL、HSV、HWB 和透明度。
- [**JSON 格式化**](http://tool.lstarr.xyz/tools/json-formatter/)：输入 JSON 后查看可折叠的树状节点；支持节点值编辑并回写到源文本，以及格式化、紧凑、转义、移除转义、全部折叠与展开。
- [**URL 编码解码**](http://tool.lstarr.xyz/tools/url-codec/)：在浏览器本地对 URL、查询参数及任意文本进行百分号编码或解码，解码时兼容查询字符串中的加号空格。
- [**MD5 加密**](http://tool.lstarr.xyz/tools/md5/)：实时生成文本的 32 位、16 位及大小写四种 MD5 摘要；也可拖拽或选择文件，在浏览器本地分块计算标准 32 位小写 MD5。
- [**时间戳转换**](http://tool.lstarr.xyz/tools/timestamp/)：在秒级或默认毫秒级时间戳与年月日时分秒之间双向转换，支持复制标准、斜杠、中文、ISO 8601 等日期格式。
- [**随机密码生成器**](http://tool.lstarr.xyz/tools/password-generator/)：自定义密码长度与字符池，一次生成 10 个密码；可复制，或仅保存密码及保存时间到当前浏览器本地存储。
- [**图片 OCR 文字识别**](http://tool.lstarr.xyz/tools/ocr/)：基于 PaddleOCR 和 WebAssembly，在浏览器本地识别图片中的中英文文字；可选极速 PP-OCRv6 Tiny 或标准 PP-OCRv5 模式，模型与运行时均随站点部署、按需从本站加载。
- [**Markdown 与 Word 文件转换**](http://tool.lstarr.xyz/tools/document-converter/)：上传 Markdown 或 DOCX 文件，在浏览器本地完成 Markdown 转可编辑 DOCX，或 DOCX 转 Markdown；支持点击与拖拽上传。

## 规划中的工具

- PDF 与更多文档格式转换

欢迎通过 Issue 提出常用工具需求。

## 本地开发

```bash
npm install
npm run dev
```

### OCR CDN（可选）

默认情况下，OCR 模型和 WASM 资源由本站按需提供。若站点部署在 GitHub Pages 等海外源站且主要面向国内用户，可复制 [`.env.example`](.env.example) 为 `.env.local`，配置资源 CDN 基址后重新构建：

- `VITE_OCR_MODEL_CDN_BASE_URL`：Paddle 官方模型源可用 `https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/`；也可替换为已同步四个 `.tar` 模型文件的自有 OSS/CDN。
- `VITE_OCR_WASM_CDN_BASE_URL`：可填写与锁定版本一致的 ONNX Runtime 静态文件 CDN，例如 `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/`。国内生产环境更建议将这些文件同步到自有 OSS 后接入阿里云、腾讯云或又拍云 CDN。

未设置变量时不会访问以上 CDN。

OCR 页面也提供“资源加载配置”：可即时选择本站、Paddle 官方、jsDelivr 或自定义地址。自定义地址可使用 `http://`、`https://` 或 `/ocr-assets/` 一类相对路径，保存后在下一次识别生效；若当前页面使用 HTTPS，浏览器可能阻止 HTTP 资源。

质量检查与生产构建：

```bash
npm run test
npm run lint
npm run build
```

## 部署

推送到 `main` 会触发 GitHub Actions：安装依赖、运行测试与 Lint、打包 `dist`，并自动部署到 GitHub Pages。构建后的 `dist` 不提交到仓库；可在对应 Actions 运行的 Artifacts 中下载。

更多贡献约定请参阅 [AGENTS.md](AGENTS.md)。
