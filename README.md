# WeChat Markdown Editor

一个专为微信公众号设计的 Markdown 编辑器，将 Markdown 转换为带有精美样式的 HTML，支持代码高亮、数学公式、多主题等功能。

> **参考说明**：本项目功能参考自 [baoyu-markdown-to-html](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-markdown-to-html) Skill，是其完整的 Web 应用实现版本。

## 功能特性

### 核心功能
- 📝 **Markdown 转 HTML** - 实时预览，一键复制到公众号编辑器
- 🎨 **多主题系统** - 经典、优雅、简洁、现代四种主题风格
- 🌈 **丰富配色** - 13 种预设颜色（蓝、绿、朱、紫、天蓝、玫、橄榄、墨、橙、红、粉、灰、黄）
- 🔤 **字体选择** - 黑体、宋体等多种中文字体
- 📐 **字号调节** - 14px 至 18px 可选

### 代码增强
- 💻 **语法高亮** - 支持 20+ 编程语言（JavaScript、Python、Go、Rust 等）
- 🍎 **Mac 风格代码块** - 可选显示红黄绿窗口按钮
- 🔢 **行号显示** - 代码块可选显示行号

### Markdown 扩展
- 📊 **表格** - GitHub 风格表格支持
- ⚠️ **Alert 警告块** - `> [!NOTE]`、`> [!WARNING]` 等 GFM 警告
- 🔗 **外链处理** - 可选将外部链接转为底部引用
- 📖 **阅读时间** - 自动计算字数和预计阅读时间
- 📎 **脚注** - 支持 Markdown 脚注语法

## 技术栈

- **框架**: Next.js 16.2 + React 19
- **样式**: Tailwind CSS 4
- **Markdown 解析**: marked
- **代码高亮**: highlight.js
- **CSS 内联**: juice
- **数学公式**: KaTeX

## 开始使用

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 与 baoyu-markdown-to-html Skill 的功能对比

| 功能 | wechat-md (本项目) | baoyu-markdown-to-html |
|------|-------------------|------------------------|
| Markdown 转 HTML | ✅ | ✅ |
| 微信公众号适配 | ✅ | ✅ |
| 多主题系统 (4种) | ✅ | ✅ |
| 代码高亮 | ✅ | ✅ |
| CSS 内联 | ✅ | ✅ |
| 配色预设 (13种) | ✅ | ✅ |
| 字体选择 | ✅ | ✅ |
| GFM 警告块 | ✅ | ✅ |
| 外链转底部引用 | ✅ | ✅ |
| 阅读时间统计 | ✅ | ✅ |
| **Web 界面** | ✅ **完整编辑器** | ❌ CLI 工具 |
| **实时预览** | ✅ **左右分栏** | ❌ |
| **图片占位符处理** | ❌ | ✅ |
| **Mermaid 图表** | ❌ | ✅ |
| **PlantUML 图表** | ❌ | ✅ |
| **注音符号 (Ruby)** | ❌ | ✅ |
| **图片图例配置** | ❌ | ✅ |
| **HTML 文件输出** | ❌ 仅复制到剪贴板 | ✅ 生成 HTML 文件 |
| **图片本地化处理** | ❌ | ✅ |
| **EXTEND.md 配置** | ❌ | ✅ |

## 未复刻功能说明

以下功能在 baoyu-markdown-to-html 中存在，但当前版本尚未实现：

### 1. 图表支持
- **Mermaid 图表** - ` ```mermaid ` 流程图、时序图等
- **PlantUML 图表** - ` ```plantuml ` UML 图表

### 2. 高级文本功能
- **注音符号 (Ruby)** - `{base|annotation}` 语法，如 `{汉字|hàn zì}`

### 3. 图片处理
- **图片占位符** - 将 Markdown 图片替换为占位符，后续再替换
- **图片本地化** - 自动下载远程图片到本地
- **图例配置** - 通过 `--legend` 配置图片标题/alt 显示方式

### 4. 配置系统
- **EXTEND.md 配置** - 支持项目级、用户级的默认主题和样式配置

### 5. 输出方式
- **HTML 文件生成** - 当前仅支持复制到剪贴板，不支持直接生成 HTML 文件
- **文件备份** - 生成 HTML 时自动备份已有文件

## 部署

本项目可部署到 Vercel：

```bash
pnpm build
```

## 许可证

MIT
