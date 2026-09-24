# Lstar Tools

一个面向开发者的轻量在线工具箱。所有现有工具均在浏览器本地运行，不上传图片、JSON 或其他输入内容。

在线访问：[Lstar Tools](https://lstarxyx.github.io/lstar-tool/)

## 已实现工具

- [**图片 / Base64 互转**](https://lstarxyx.github.io/lstar-tool/tools/image-base64/)：拖拽或选择图片生成 Base64；也可粘贴带或不带 `data:image/...;base64,` 前缀的内容生成图片。无前缀时默认按 JPG 解析，支持预览大图与下载。
- [**JSON 格式化**](https://lstarxyx.github.io/lstar-tool/tools/json-formatter/)：输入 JSON 后查看可折叠的树状节点；支持节点值编辑并回写到源文本，以及格式化、紧凑、转义、移除转义、全部折叠与展开。

## 规划中的工具

- 二维码生成与解析
- HEX、RGB、HSL 颜色转换
- URL 编码与解码
- 时间戳与日期转换
- 文本与代码处理工具

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
