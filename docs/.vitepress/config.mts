import { defineConfig } from 'vitepress'

// 由于站点会发布到 https://liuxu89.github.io/antisoft/，
// 所以 base 必须设置为仓库名；如果以后绑定自定义域名，改成 '/' 即可。
export default defineConfig({
  lang: 'zh-CN',
  title: 'Antisoft',
  description: 'Antisoft 技术博客',
  base: '/antisoft/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/antisoft/favicon.svg' }]],

  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: 'Python', link: '/python/' },
      { text: '文章', link: '/posts/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '部署到 GitHub Pages', link: '/guide/deploy' }
          ]
        }
      ],
      '/posts/': [
        {
          text: '文章',
          items: [
            { text: '全部文章', link: '/posts/' },
            { text: 'Hello Antisoft', link: '/posts/hello-antisoft' }
          ]
        }
      ],
      '/python/': [
        {
          text: 'Python',
          items: [
            { text: '栏目首页', link: '/python/' }
          ]
        },
        {
          text: '环境管理',
          items: [
            { text: '环境管理基础', link: '/python/environment/' }
          ]
        },
        {
          text: '命令行与模块',
          items: [
            { text: 'python -m 的用法', link: '/python/cli/python-m' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/liuxu89/antisoft' }
    ],
    outline: { label: '本页目录', level: [2, 3] },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    notFound: {
      title: '页面未找到',
      quote: '你访问的页面不存在或已被移动。',
      linkLabel: '返回首页',
      linkText: '返回首页'
    }
  }
})
