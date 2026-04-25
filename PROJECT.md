# WeChat Markdown Editor - 项目说明文档

> 最后更新：2026-04-25

## 一、项目概述

**wechat-md** 是一个专为微信公众号设计的 Markdown 编辑器，将 Markdown 转换为带有精美样式的 HTML，支持代码高亮、数学公式、多主题等功能。

### 核心定位
- 微信公众号内容创作工具
- Markdown → 微信公众号 HTML 格式转换
- 实时预览，一键复制到公众号编辑器

### 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.4 | 全栈框架 |
| React | 19.2.4 | UI 框架 |
| Tailwind CSS | 4 | UI 样式 |
| marked | 18.0.2 | Markdown 解析器 |
| highlight.js | 11.11.1 | 代码语法高亮 |
| juice | 11.1.1 | CSS 内联化（服务端） |
| KaTeX | 0.16.45 | 数学公式渲染 |
| reading-time | 1.5.0 | 阅读时间计算 |
| front-matter | 4.0.2 | YAML front matter 解析 |

---

## 二、项目架构

```
wechat-md/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主编辑器页面（客户端组件）
│   │   ├── layout.tsx        # 根布局
│   │   ├── globals.css       # 全局样式
│   │   └── api/convert/
│   │       └── route.ts      # 服务端转换 API
│   └── lib/
│       ├── types.ts          # TypeScript 类型定义
│       ├── constants.ts      # 常量（字体、配色、主题默认值）
│       ├── client-converter.ts  # 客户端渲染器（浏览器端使用）
│       ├── renderer.ts       # 服务端渲染器（API 路由使用）
│       ├── inline-styles.ts  # 内联样式生成器
│       ├── html-builder.ts   # HTML 构建工具（juice 内联等）
│       ├── converter.ts      # 服务端转换入口
│       ├── color-utils.ts    # 颜色工具（HEX↔HSL 转换）
│       └── themes/           # CSS 主题文件
│           ├── base.css
│           ├── tech.css
│           ├── growth.css
│           └── index.ts
├── PROJECT.md                # 本文档
├── README.md                 # 项目 README
└── package.json
```

---

## 三、核心模块

### 3.1 编辑器页面 (`src/app/page.tsx`)

- **左右分栏布局**：左侧 Markdown 编辑，右侧实时预览
- **响应式设计**：移动端 Tab 切换，桌面端并排显示
- **防抖机制**：输入后 100ms 延迟转换
- **复制功能**：Clipboard API 支持 `text/html` 和 `text/plain`

**状态管理**：
```typescript
theme: "tech" | "growth"           // 主题
fontFamily: "sans" | "serif" | ... // 字体
fontSize: "14px" | "16px"          // 字号
macCodeBlock: boolean              // Mac 风格代码块
showLineNumber: boolean            // 行号显示
citeLinks: boolean                 // 外链转引用
showReadingTime: boolean           // 阅读时间
keepTitle: boolean                 // 保留标题
legend: string                     // 图片标题显示方式
colorLightness: number             // 主题深浅调节（-30 ~ +30）
```

### 3.2 Markdown 渲染器

**客户端** (`src/lib/client-converter.ts`)：
- 自实现 front-matter 解析
- 浏览器端实时预览

**服务端** (`src/lib/renderer.ts`)：
- 依赖 `front-matter` 库
- API 路由使用

**自定义 Renderer 覆盖的元素**：
- heading (h1-h6)、paragraph、blockquote（支持 alerts）
- code（支持 Mac 窗口按钮、行号）、codespan
- list / listitem、image（支持图例）
- link（支持外链转引用）、strong / em
- table / tablecell、hr

### 3.3 内联样式系统 (`src/lib/inline-styles.ts`)

**核心创新**：不使用 CSS 变量 + juice，直接生成内联样式字符串。

**主题样式构建函数**：
- `buildTechStyles()` - 科技主题：橙色系（`#E88A3C`）
- `buildGrowthStyles()` - 成长主题：绿色系（`#6DB87A`）

**代码高亮配色**：
- `CODE_HIGHLIGHT_STYLES` - github-light 风格
- `CODE_HIGHLIGHT_STYLES_DARK` - 科技主题深色配色

### 3.4 常量配置 (`src/lib/constants.ts`)

- **13 种预设颜色**：蓝、绿、朱、黄、紫、天蓝、玫、橄榄、黑、灰、粉、红、橙
- **字体映射**：黑体、宋体、思源宋体、等宽
- **主题默认样式**：每个主题有自己的 primaryColor、accentColor 等

### 3.5 HTML 构建工具 (`src/lib/html-builder.ts`)

- `buildCss()` - 构建 CSS 变量
- `inlineCss()` - 使用 juice 将 CSS 内联
- `normalizeCssText()` - CSS 变量替换为实际值
- `modifyHtmlStructure()` - 修复嵌套列表结构

### 3.6 颜色工具 (`src/lib/color-utils.ts`)

完整的颜色转换工具链：`HEX ↔ RGB ↔ HSL`

---

## 四、主题系统

| 主题 | 主色 | 风格 | 适用场景 |
|------|------|------|----------|
| **tech** | `#E88A3C` 橙色 | 温暖创新，深色代码块 | 技术文章 |
| **growth** | `#6DB87A` 绿色 | 安静生长，清新自然 | 成长感悟 |

每个主题包含完整的样式定义：
- 标题（h1-h6）颜色、字号、间距
- 段落、引用、列表样式
- 代码块背景、字体
- 表格样式
- 链接、图片、脚注样式
- Alert 警告块样式（5 种）

---

## 五、数据流

```
用户输入 Markdown
        ↓
  [防抖 100ms]
        ↓
  doConvert() 函数
        ↓
  buildInlineStyles(styleConfig) → 生成内联样式对象
        ↓
  renderMarkdown(markdown, options, style)
        ↓
  marked.parse() + 自定义 Renderer
        ↓
  生成带内联样式的 HTML
        ↓
  dangerouslySetInnerHTML → 预览区域
        ↓
  用户点击"复制到公众号" → Clipboard API
```

---

## 六、特色功能

1. **主题深浅调节**：通过 `colorLightness`（-30 ~ +30）动态调整颜色亮度
2. **Mac 风格代码块**：顶部显示红黄绿窗口按钮的 SVG 图标
3. **代码行号**：flex 布局实现左侧行号、右侧代码
4. **脚注支持**：Markdown 脚注语法 `[^1]` → 底部引用列表
5. **Alert 警告块**：`> [!NOTE]`、`> [!WARNING]` 等 GFM 语法
6. **外链转引用**：可选将外部链接添加上标引用编号
7. **阅读时间统计**：自动计算字数和预计阅读时间
8. **图片图例**：支持 alt、title 组合显示为图片标题

---

## 七、已实现功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 转 HTML | ✅ | 实时预览，一键复制 |
| 微信公众号适配 | ✅ | 内联样式，兼容公众号编辑器 |
| 多主题系统 | ✅ | tech / growth 两种主题 |
| 代码高亮 | ✅ | 25+ 种编程语言 |
| CSS 内联 | ✅ | 直接生成内联样式 |
| 配色预设 | ✅ | 13 种颜色 |
| 字体选择 | ✅ | 黑体、宋体等 |
| GFM 警告块 | ✅ | NOTE、TIP、IMPORTANT、WARNING、CAUTION |
| 外链转底部引用 | ✅ | 可选开启 |
| 阅读时间统计 | ✅ | 自动计算 |
| Web 界面 | ✅ | 左右分栏编辑器 |
| 实时预览 | ✅ | 100ms 防抖 |
| 主题深浅调节 | ✅ | -30 ~ +30 范围 |
| Mac 代码块 | ✅ | 红黄绿窗口按钮 |
| 代码行号 | ✅ | 左侧行号显示 |
| 图片图例 | ✅ | alt / title 组合 |
| 脚注支持 | ✅ | Markdown 脚注语法 |
| 响应式设计 | ✅ | 移动端适配 |

---

## 八、未实现功能（待跟进）

### 8.1 图表支持
| 功能 | 优先级 | 说明 | 状态 |
|------|--------|------|------|
| Mermaid 图表 | P1 | ` ```mermaid ` 流程图、时序图等 | ❌ 未实现 |
| PlantUML 图表 | P2 | ` ```plantuml ` UML 图表 | ❌ 未实现 |

### 8.2 高级文本功能
| 功能 | 优先级 | 说明 | 状态 |
|------|--------|------|------|
| 注音符号 (Ruby) | P3 | `{汉字|hàn zì}` 语法 | ❌ 未实现 |

### 8.3 图片处理
| 功能 | 优先级 | 说明 | 状态 |
|------|--------|------|------|
| 图片占位符 | P2 | 将 Markdown 图片替换为占位符 | ❌ 未实现 |
| 图片本地化 | P2 | 自动下载远程图片到本地 | ❌ 未实现 |
| 图例配置增强 | P3 | 通过 `--legend` 配置图片标题/alt 显示方式 | ⚠️ 部分实现 |

### 8.4 配置系统
| 功能 | 优先级 | 说明 | 状态 |
|------|--------|------|------|
| EXTEND.md 配置 | P3 | 支持项目级、用户级的默认主题和样式配置 | ❌ 未实现 |

### 8.5 输出方式
| 功能 | 优先级 | 说明 | 状态 |
|------|--------|------|------|
| HTML 文件生成 | P1 | 生成独立 HTML 文件 | ❌ 未实现 |
| 文件备份 | P2 | 生成 HTML 时自动备份已有文件 | ❌ 未实现 |

### 8.6 其他增强功能
| 功能 | 优先级 | 说明 | 状态 |
|------|--------|------|------|
| 更多主题 | P2 | 增加 default、grace、simple、modern 主题 | ❌ 未实现 |
| 自定义颜色选择器 | P2 | 颜色面板手动选色 | ❌ 未实现 |
| 导出 PDF | P3 | 将内容导出为 PDF 格式 | ❌ 未实现 |
| 历史记录 | P3 | 保存编辑历史，支持回退 | ❌ 未实现 |
| 模板系统 | P3 | 预设文章模板 | ❌ 未实现 |

---

### 项目统计

- **源文件数**：16
- **代码行数**：2105
- **最后更新**：2026-04-25


---

## 九、开发指南

### 9.1 启动开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 9.2 构建

```bash
pnpm build
```

### 9.3 代码检查

```bash
pnpm lint
```

### 9.4 部署

可部署到 Vercel 或其他 Node.js 托管平台。

---

## 十、项目更新日志

| 日期 | 更新内容 | 提交 |
| 2026-04-25 | feat: 完善项目文档和 git hook 自动更新机制 | `efe1b79` |
| 2026-04-25 | feat: 完善项目文档和 git hook 自动更新机制 | `031e4e9` |
| 2026-04-25 | feat: 完善项目文档和 git hook 自动更新机制 | `c59547d` |
| 2026-04-25 | feat: 完善项目文档和 git hook 自动更新机制 | `b8c3d44` |
| 2026-04-25 | feat: 完善项目文档和 git hook 自动更新机制 | `fb1cf04` |
| 2026-04-25 | docs: 添加项目说明文档和自动更新机制 | `1626b23` |
|------|----------|------|
| 2026-04-25 | 初始项目文档，记录已实现和未实现功能 | - |

---

## 十一、参考

- 项目功能参考：[baoyu-markdown-to-html](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-markdown-to-html)
- Next.js 文档：`node_modules/next/dist/docs/`
