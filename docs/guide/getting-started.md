# 快速开始

本指南介绍如何在本地运行 Antisoft 博客。

## 环境要求

- Node.js 18 及以上版本
- npm 或 pnpm

## 安装依赖

```bash
npm install
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
