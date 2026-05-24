[English](README.md) | [中文](README_zh.md)

# Song 的作品集

零依赖、纯原生前端作品集网站，展示摄影、AIGC 创作和创意编程项目。仅用 HTML、CSS 和 JavaScript 构建 — 无框架，无构建步骤。

## 在线预览

在浏览器中打开 `index.html`，或在本地启动服务：

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .

# 或直接双击打开 index.html
```

## 功能特性

- **Canvas 探照灯 Hero** — 深色遮罩随鼠标移动而消散，像手电筒一样揭示背景图
- **3D 视差标题** — 标题随鼠标位置产生透视倾斜效果
- **打字机动画** — 循环播放 7 个分类名称，逐个打字、暂停、删除
- **分类筛选画廊** — 7 个分类（风光、人像、城市、生活、建筑、AIGC、Vibe Coding），平滑过渡切换
- **3D CSS 翻转卡片** — 简历卡片点击翻转，展示详细内容
- **滚动揭示动画** — 基于 IntersectionObserver 的淡入效果，带错落延迟
- **媒体预览弹窗** — 点击任意图片或视频，全屏遮罩查看
- **响应式设计** — 1-4 列网格自适应手机到大屏
- **暗色主题** — 玻璃拟态卡片，金色 (#EAB308) 点缀
- **无障碍访问** — `aria` 标签、键盘导航、`prefers-reduced-motion` 支持

## 项目结构

```
├── index.html          # 单页面应用入口
├── style.css           # 全部自定义样式（~710 行）
├── script.js           # 全部交互逻辑（~830 行）
├── images.json         # 自动生成的图片清单
├── generate-manifest.sh # 重新生成 images.json 的 Shell 脚本
├── favicon.png         # 网站图标
├── images/
│   ├── logo1.png, logo2.png, logo.svg   # 品牌 Logo
│   ├── hero-bg/        # Hero 区域背景图
│   ├── about/          # 关于页照片、个人简介和简历内容
│   ├── landscape/      # 风光摄影
│   ├── portrait/       # 人像摄影
│   ├── cityscape/      # 城市摄影
│   ├── lifestyle/      # 生活摄影
│   ├── architecture/   # 建筑项目（含子分组）
│   ├── aigc/           # AI 生成内容（含子分组）
│   └── vibe-coding/    # 创意编程项目
└── .github/            # （可选）GitHub 工作流
```

## 添加新图片

1. 将图片放入 `images/` 下的对应分类文件夹
2. 重新生成清单文件：

```bash
bash generate-manifest.sh
```

对于含子分组的分类（建筑、AIGC），脚本会自动检测文件夹结构并生成分组条目到 `images.json`。

## 自定义

- **内容**：编辑 `images/about/content.js` 中的简介和 `images/about/resume.js` 中的简历
- **样式**：修改 `style.css` — 颜色、动画、断点都在一个文件中
- **行为**：`script.js` 包含所有按区域组织的交互逻辑
- **清单**：直接编辑 `images.json` 或运行 Shell 脚本重新生成

## 技术栈

| 层级 | 技术 |
|-------|-----------|
| 结构 | HTML5 |
| 样式 | CSS3, Tailwind CSS (CDN) |
| 逻辑 | Vanilla JavaScript (ES6+) |
| 字体 | Inter (Google Fonts) |
| 构建 | 无 — 零依赖 |

## 浏览器兼容

所有现代浏览器（Chrome、Firefox、Safari、Edge）。需要支持 IntersectionObserver、CSS Grid、CSS 3D 变换和 Canvas API。

## 许可

保留所有权利。摄影、艺术作品和代码均为原创。
