"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { renderMarkdown } from "@/lib/client-converter";
import {
  DEFAULT_STYLE,
  THEME_STYLE_DEFAULTS,
  FONT_FAMILY_MAP,
} from "@/lib/constants";
import type { ConvertOptions, StyleConfig } from "@/lib/types";

const SAMPLE_MD = `# 用 AI 重塑内容创作

> 你看事情的方式，决定事情存在的形式。

## 为什么用 Markdown 写公众号？

微信公众号的编辑器**功能有限**，排版效率低。用 Markdown 写作，再转换为公众号格式，可以：

- ✍️ 专注于**内容**而非排版
- 🎨 统一的视觉风格，一键切换主题
- 📦 版本管理，Git 友好
- ⚡ 写作效率提升 3 倍以上

## 代码高亮

\`\`\`python
def hello_ai():
    """AI 时代的第一个函数"""
    name = "Prism"
    print(f"Hello, {name}! Welcome to the future.")
    return True
\`\`\`

\`\`\`javascript
const future = await ai.think({
  deep: true,
  creative: true,
});
console.log(future); // 🚀
\`\`\`

## 表格支持

| 工具 | 用途 | 推荐度 |
|------|------|--------|
| Claude Code | AI 编程助手 | ⭐⭐⭐⭐⭐ |
| Cursor | AI 编辑器 | ⭐⭐⭐⭐ |
| v0 | UI 生成 | ⭐⭐⭐⭐ |

## 引用与强调

爱因斯坦说过：

> 我们不能用制造问题时的同一水平思维来解决问题。

这句话在 AI 时代更加适用。*当我们用新的工具重新审视旧的问题，往往能发现全新的解法。*

## 有序列表

1. 写 Markdown
2. 选择主题和配色
3. 一键复制
4. 粘贴到公众号编辑器

---

**试试切换不同的主题和配色**，找到你最喜欢的风格 🎨
`;

type ThemeName = "tech" | "growth";

const THEMES: { name: ThemeName; label: string; desc: string }[] = [
  { name: "tech", label: "科技", desc: "温暖创新，适合AI/技术文章" },
  { name: "growth", label: "成长", desc: "安静生长，适合成长感悟" },
];

const FONT_OPTIONS = [
  { name: "sans", label: "黑体" },
  { name: "serif", label: "宋体" },
  { name: "serif-cjk", label: "思源宋体" },
  { name: "mono", label: "等宽" },
];

const FONT_SIZE_OPTIONS = ["14px", "16px"];

export default function EditorPage() {
  const [markdown, setMarkdown] = useState(SAMPLE_MD);
  const [html, setHtml] = useState("");
  const [theme, setTheme] = useState<ThemeName>("tech");
  const [fontFamily, setFontFamily] = useState("sans");
  const [fontSize, setFontSize] = useState("16px");
  const [macCodeBlock, setMacCodeBlock] = useState(true);
  const [showLineNumber, setShowLineNumber] = useState(false);
  const [citeLinks, setCiteLinks] = useState(false);
  const [showReadingTime, setShowReadingTime] = useState(false);
  const [keepTitle, setKeepTitle] = useState(false);
  const [legend, setLegend] = useState("none");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [colorLightness, setColorLightness] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doConvert = useCallback((md: string, opts: ConvertOptions) => {
    setLoading(true);
    try {
      const fontFamily = opts.fontFamily
        ? FONT_FAMILY_MAP[opts.fontFamily] ?? opts.fontFamily
        : undefined;
      const themeDefaults = THEME_STYLE_DEFAULTS[opts.theme] || {};
      const style: StyleConfig = {
        ...DEFAULT_STYLE,
        ...themeDefaults,
        ...(fontFamily ? { fontFamily } : {}),
        ...(opts.fontSize ? { fontSize: opts.fontSize } : {}),
        theme: opts.theme,
        colorLightness: opts.colorLightness,
      };
      const { html: renderedHtml } = renderMarkdown(md, opts, style);
      setHtml(renderedHtml);
    } catch (err) {
      console.error("Convert failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doConvert(markdown, {
        theme,
        fontFamily,
        fontSize,
        macCodeBlock,
        showLineNumber,
        citeLinks,
        showReadingTime,
        keepTitle,
        legend: legend === "none" ? undefined : legend,
        colorLightness,
      });
    }, 100);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    markdown, theme, fontFamily, fontSize,
    macCodeBlock, showLineNumber, citeLinks, showReadingTime, keepTitle, legend,
    colorLightness,
    doConvert,
  ]);

  const handleCopy = async () => {
    if (!previewRef.current) return;
    try {
      const htmlContent = previewRef.current.innerHTML;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const textBlob = new Blob([htmlContent], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select all and copy
      const range = document.createRange();
      range.selectNodeContents(previewRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand("copy");
      sel?.removeAllRanges();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">
            📝 md2wechat
          </h1>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Markdown → 微信公众号
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="设置面板"
          >
            ⚙️ 设置
          </button>
          <button
            onClick={handleCopy}
            disabled={!html}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              copied
                ? "bg-green-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {copied ? "✅ 已复制" : "📋 复制到公众号"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0 p-4 space-y-5 hidden lg:block">
            {/* Theme */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                🎨 主题
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`px-2 py-2 text-xs rounded-lg border transition-all text-left ${
                      theme === t.name
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <div className="font-medium">{t.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Lightness */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                🎨 主题深浅
              </label>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">深</span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {colorLightness > 0 ? `+${colorLightness}%` : `${colorLightness}%`}
                  </span>
                  <span className="text-[10px] text-gray-400">浅</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={colorLightness}
                  onChange={(e) => setColorLightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Font */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Aa 字体
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setFontFamily(f.name)}
                    className={`px-2 py-1.5 text-xs rounded-lg border transition-all ${
                      fontFamily === f.name
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                    style={{
                      fontFamily:
                        f.name === "mono"
                          ? "monospace"
                          : f.name === "serif" || f.name === "serif-cjk"
                          ? "serif"
                          : "sans-serif",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                字号
              </label>
              <div className="flex gap-1.5">
                {FONT_SIZE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-all ${
                      fontSize === s
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                ⚡ 选项
              </label>
              <div className="space-y-2">
                {[
                  { key: "macCodeBlock", label: "Mac 代码块", val: macCodeBlock, set: setMacCodeBlock },
                  { key: "showLineNumber", label: "行号", val: showLineNumber, set: setShowLineNumber },
                  { key: "citeLinks", label: "引用链接", val: citeLinks, set: setCiteLinks },
                  { key: "showReadingTime", label: "阅读时间", val: showReadingTime, set: setShowReadingTime },
                  { key: "keepTitle", label: "保留标题", val: keepTitle, set: setKeepTitle },
                ].map(({ key, label, val, set }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => set(e.target.checked)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Legend */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                🖼️ 图片标题
              </label>
              <select
                value={legend}
                onChange={(e) => setLegend(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="none">不显示</option>
                <option value="alt">alt 文本</option>
                <option value="title">title 文本</option>
                <option value="title-alt">title · alt</option>
                <option value="alt-title">alt · title</option>
              </select>
            </div>
          </aside>
        )}

        {/* Mobile Settings Modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="absolute right-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800">⚙️ 设置</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-lg">✕</button>
              </div>
              {/* Theme */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">🎨 主题</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setTheme(t.name)}
                      className={`px-2 py-2 text-xs rounded-lg border text-left ${
                        theme === t.name ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <div className="font-medium">{t.label}</div>
                      <div className="text-[10px] opacity-70">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Color */}
              {/* Font */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Aa 字体</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setFontFamily(f.name)}
                      className={`px-2 py-1.5 text-xs rounded-lg border ${
                        fontFamily === f.name ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">字号</label>
                <div className="flex gap-1.5">
                  {FONT_SIZE_OPTIONS.map((s) => (
                    <button key={s} onClick={() => setFontSize(s)} className={`flex-1 px-1 py-1 text-xs rounded-lg border ${fontSize === s ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>{s}</button>
                  ))}
                </div>
              </div>
              {/* Toggles */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">⚡ 选项</label>
                <div className="space-y-2">
                  {[
                    { label: "Mac 代码块", val: macCodeBlock, set: setMacCodeBlock },
                    { label: "行号", val: showLineNumber, set: setShowLineNumber },
                    { label: "引用链接", val: citeLinks, set: setCiteLinks },
                    { label: "阅读时间", val: showReadingTime, set: setShowReadingTime },
                    { label: "保留标题", val: keepTitle, set: setKeepTitle },
                  ].map(({ label, val, set }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="rounded" />
                      <span className="text-xs text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Legend */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">🖼️ 图片标题</label>
                <select value={legend} onChange={(e) => setLegend(e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded-lg">
                  <option value="none">不显示</option>
                  <option value="alt">alt 文本</option>
                  <option value="title">title 文本</option>
                  <option value="title-alt">title · alt</option>
                  <option value="alt-title">alt · title</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Mobile Tab Bar */}
          <div className="flex lg:hidden border-b border-gray-200">
            <button
              onClick={() => setMobileTab("edit")}
              className={`flex-1 py-2 text-sm font-medium ${
                mobileTab === "edit" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              ✏️ 编辑
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-2 text-sm font-medium ${
                mobileTab === "preview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              👁️ 预览
            </button>
          </div>

          {/* Editor */}
          <div className={`flex-1 flex flex-col border-r border-gray-200 ${mobileTab === "edit" ? "" : "hidden lg:flex"}`}>
            <div className="px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-2">
              <span>✏️ Markdown</span>
              <span className="ml-auto text-gray-400">{markdown.length} 字</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 p-4 font-mono text-sm bg-white resize-none focus:outline-none leading-relaxed"
              placeholder="在这里输入 Markdown..."
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className={`flex-1 flex flex-col bg-white ${mobileTab === "preview" ? "" : "hidden lg:flex"}`}>
            <div className="px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-2">
              <span>👁️ 预览</span>
              {loading && (
                <span className="ml-auto text-blue-500 animate-pulse">转换中...</span>
              )}
            </div>
              <div className="flex-1 overflow-y-auto bg-gray-50">
              <div style={{ maxWidth: '860px', margin: '16px auto' }}>
                <div
                  ref={previewRef}
                  className="p-6"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
