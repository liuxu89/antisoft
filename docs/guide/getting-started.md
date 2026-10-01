# 快速开始

本指南介绍如何在本地运行 Antisoft 博客。

## 环境要求

- Node.js 24 LTS（版本由根目录 `.nvmrc` 指定）
- npm
- VitePress 2.0.0-alpha.20（由项目依赖安装）

使用 nvm 时，在仓库根目录运行 `nvm install` 和 `nvm use`。

## 安装依赖

```bash
npm ci
```

## 启动开发服务器

```bash
npm run docs:dev
```

浏览器访问 `http://localhost:5173` 即可预览，Markdown 修改后会即时热更新。

## 构建生产版本

```bash
npm run docs:build
```

构建产物会输出到 `docs/.vitepress/dist`，可用于本地预览：

```bash
npm run docs:preview
```
