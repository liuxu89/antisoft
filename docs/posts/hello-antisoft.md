# Hello, Antisoft

这是 Antisoft 技术博客的第一篇文章。

## 这个博客是怎么搭建的

- 使用 [VitePress](https://vitepress.dev) 生成静态站点
- 使用 GitHub Actions 自动构建
- 发布到 GitHub Pages：`https://liuxu89.github.io/antisoft/`

## 本地开发

```bash
npm install
npm run docs:dev
```

## 写新文章

在 `docs/posts/` 目录下新建 Markdown 文件，并在 `docs/.vitepress/config.mts` 的 `sidebar` 中登记即可。
