# Antisoft

Antisoft 技术博客，基于 [VitePress](https://vitepress.dev) 构建，通过 GitHub Actions 自动部署到 GitHub Pages。

## 访问地址

🔗 **https://liuxu89.github.io/antisoft/**

## 本地开发

使用 Node.js 24 LTS 和 npm，VitePress 固定为 `2.0.0-alpha.20`。使用 nvm 时，可先运行 `nvm install` 和 `nvm use`。

```bash
npm ci
npm run docs:dev
```

## 构建与部署

推送到 `main` 分支后，GitHub Actions 会自动构建并发布：

```bash
npm run docs:build
```

部署前，可先在本地构建并预览生成的站点，检查页面、链接和样式：

```bash
npm run docs:build
npm run docs:preview
```

`docs:preview` 用于预览构建产物；修改文档后需重新构建才能看到更新。

## 栏目

- **Python**：不定期更新
- **文章**：开发经验与思考
- **文摘**：论文精译与阅读摘录
- **指南**：工具链操作步骤
