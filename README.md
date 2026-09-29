# Lstar Tools

一个面向开发者的轻量在线工具箱。所有现有工具均在浏览器本地运行，不上传图片、JSON 或其他输入内容。

在线访问：[Lstar Tools](http://tool.lstarr.xyz/)

## 修改站点地址

站点根地址只在 [`src/data/siteConfig.ts`](src/data/siteConfig.ts) 的 `configuredSiteUrl` 中维护。迁移域名或子路径时修改该值并重新构建；Vite 的资源根路径、站内跳转、SEO 元数据、站点地图、robots、llms 文档和 GitHub Pages 的 CNAME 都会同步更新。

## 已实现工具

- [**图片 / Base64 互转**](http://tool.lstarr.xyz/tools/image-base64/)：拖拽或选择图片生成 Base64；也可粘贴带或不带 `data:image/...;base64,` 前缀的内容生成图片。无前缀时默认按 JPG 解析，支持预览大图与下载。
- [**二维码生成工具**](http://tool.lstarr.xyz/tools/qrcode/)：为文字、网址和公开的图片或视频链接生成并下载 PNG 二维码。二维码无法容纳普通媒体文件，因此媒体需先托管在可公开访问的位置。
- [**颜色取色与转换**](http://tool.lstarr.xyz/tools/color/)：通过系统取色盘或输入代码选择颜色，实时同步 HEX、RGB、HSL、HSV、HWB 和透明度。
- [**JSON 格式化**](http://tool.lstarr.xyz/tools/json-formatter/)：输入 JSON 后查看可折叠的树状节点；支持节点值编辑并回写到源文本，以及格式化、紧凑、转义、移除转义、全部折叠与展开。
- [**URL 编码解码**](http://tool.lstarr.xyz/tools/url-codec/)：在浏览器本地对 URL、查询参数及任意文本进行百分号编码或解码，解码时兼容查询字符串中的加号空格。
- [**MD5 加密**](http://tool.lstarr.xyz/tools/md5/)：实时生成 32 位、16 位及大小写四种 MD5 摘要，每项结果均可一键复制。
- [**时间戳转换**](http://tool.lstarr.xyz/tools/timestamp/)：在秒级或默认毫秒级时间戳与年月日时分秒之间双向转换，支持复制标准、斜杠、中文、ISO 8601 等日期格式。
- [**图片 OCR 文字识别**](http://tool.lstarr.xyz/tools/ocr/)：基于 PaddleOCR PP-OCRv5 和 WebAssembly，在浏览器本地识别图片中的中英文文字；首次使用会加载模型资源。
- [**Markdown 与 Word 文件转换**](http://tool.lstarr.xyz/tools/document-converter/)：在浏览器本地完成 Markdown 转可编辑 DOCX，及 DOCX 转 Markdown；已通过统一转换注册表预留 PDF、HTML 等后续格式。

## 规划中的工具

- PDF 与更多文档格式转换

欢迎通过 Issue 提出常用工具需求。

## 本地开发

```bash
npm install
npm run dev
```

质量检查与生产构建：

```bash
npm run test
npm run lint
npm run build
```

## 部署

推送到 `main` 会触发 GitHub Actions：安装依赖、运行测试与 Lint、打包 `dist`，并自动部署到 GitHub Pages。构建后的 `dist` 不提交到仓库；可在对应 Actions 运行的 Artifacts 中下载。

更多贡献约定请参阅 [AGENTS.md](AGENTS.md)。
