# 部署到 GitHub Pages

本仓库已经配置好 GitHub Actions，推送到 `main` 分支后会自动构建并部署。

## 发布地址

<https://liuxu89.github.io/antisoft/>

## 部署流程

1. 将代码推送到 GitHub 仓库的 `main` 分支。
2. GitHub Actions 执行 `.github/workflows/deploy.yml`。
3. 构建产物被上传为 Pages artifact。
4. `actions/deploy-pages` 将产物发布到 GitHub Pages。

## 首次使用需要

在 GitHub 仓库的 **Settings → Pages** 中，将 **Source** 设置为 **GitHub Actions**。

> 如果后续绑定了自定义域名，需要把 `docs/.vitepress/config.mts` 中的 `base` 改为 `'/'`，并重新部署。
