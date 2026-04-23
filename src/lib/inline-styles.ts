import type { StyleConfig } from './types';

// highlight.js 代码高亮颜色方案（github-light 风格）
const CODE_HIGHLIGHT_STYLES: Record<string, string> = {
  'hljs-comment': 'color: #6a737d; font-style: italic;',
  'hljs-quote': 'color: #6a737d; font-style: italic;',
  'hljs-keyword': 'color: #d73a49;',
  'hljs-selector-tag': 'color: #d73a49;',
  'hljs-built_in': 'color: #005cc5;',
  'hljs-type': 'color: #d73a49;',
  'hljs-literal': 'color: #005cc5;',
  'hljs-number': 'color: #005cc5;',
  'hljs-regexp': 'color: #032f62;',
  'hljs-string': 'color: #032f62;',
  'hljs-subst': 'color: #24292e;',
  'hljs-symbol': 'color: #005cc5;',
  'hljs-class': 'color: #6f42c1;',
  'hljs-function': 'color: #6f42c1;',
  'hljs-title': 'color: #6f42c1;',
  'hljs-params': 'color: #24292e;',
  'hljs-bullet': 'color: #e36209;',
  'hljs-meta': 'color: #735c0f;',
  'hljs-meta-keyword': 'color: #735c0f;',
  'hljs-meta-string': 'color: #032f62;',
  'hljs-section': 'color: #005cc5; font-weight: bold;',
  'hljs-tag': 'color: #22863a;',
  'hljs-name': 'color: #22863a;',
  'hljs-attr': 'color: #6f42c1;',
  'hljs-attribute': 'color: #005cc5;',
  'hljs-variable': 'color: #e36209;',
  'hljs-variable.language_': 'color: #005cc5;',
  'hljs-deletion': 'color: #b31d28; background-color: #ffeef0;',
  'hljs-addition': 'color: #22863a; background-color: #f0fff4;',
  'hljs-operator': 'color: #d73a49;',
  'hljs-punctuation': 'color: #24292e;',
  'hljs-property': 'color: #005cc5;',
  'hljs-selector-class': 'color: #6f42c1;',
  'hljs-selector-id': 'color: #005cc5;',
};

/**
 * 为 HTML 中的 highlight.js span 元素内联颜色样式
 * 支持单 class 和多 class（空格分隔）
 */
export function inlineCodeHighlightStyles(html: string): string {
  let output = html;
  for (const [className, style] of Object.entries(CODE_HIGHLIGHT_STYLES)) {
    // 匹配 class="hljs-xxx" 或 class="hljs-xxx hljs-yyy"（多 class 场景）
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      `(class="[^"]*\\b${escaped}\\b[^"]*")`,
      'g'
    );
    output = output.replace(regex, (match) => {
      // 如果已经有 style 属性，追加；否则添加
      if (match.includes('style=')) {
        return match.replace(/style="([^"]*)"/, `style="${style} $1"`);
      }
      return `${match} style="${style}"`;
    });
  }
  return output;
}

/**
 * 构建主题样式字符串，直接内联到元素上
 * 不使用 CSS 变量 + juice，直接生成内联样式
 */
export function buildInlineStyles(style: StyleConfig) {
  const { primaryColor, fontFamily, fontSize, foreground, blockquoteBackground, accentColor, containerBg } = style;
  // Convert HSL foreground to hex
  const fg = foreground.includes('%') ? '#3f3f3f' : foreground;

  return {
    container: `font-family: ${fontFamily}; font-size: ${fontSize}; line-height: 1.75; text-align: left; ${containerBg !== 'transparent' ? `background: ${containerBg};` : ''}`,

    h1: `display: table; padding: 0 1em; border-bottom: 2px solid ${primaryColor}; margin: 2em auto 1em; color: ${fg}; font-size: calc(${fontSize} * 1.2); font-weight: bold; text-align: center;`,

    h2: `display: table; padding: 0 0.2em; margin: 4em auto 2em; color: #fff; background: ${primaryColor}; font-size: calc(${fontSize} * 1.2); font-weight: bold; text-align: center;`,

    h3: `padding-left: 8px; border-left: 3px solid ${primaryColor}; margin: 2em 8px 0.75em 0; color: ${fg}; font-size: calc(${fontSize} * 1.1); font-weight: bold; line-height: 1.2;`,

    h4: `margin: 2em 8px 0.5em; color: ${primaryColor}; font-size: ${fontSize}; font-weight: bold;`,

    h5: `margin: 1.5em 8px 0.5em; color: ${primaryColor}; font-size: ${fontSize}; font-weight: bold;`,

    h6: `margin: 1.5em 8px 0.5em; font-size: ${fontSize}; color: ${primaryColor};`,

    p: `margin: 1.5em 8px; letter-spacing: 0.1em; color: ${fg};`,

    blockquote: `font-style: normal; padding: 1em; border-left: 4px solid ${primaryColor}; border-radius: 6px; color: ${fg}; background: ${blockquoteBackground}; margin-bottom: 1em; margin-top: 0; margin-right: 0;`,

    blockquoteP: `display: block; font-size: 1em; letter-spacing: 0.1em; color: ${fg}; margin: 0;`,

    ul: `list-style: circle; padding-left: 1em; margin-left: 0; color: ${fg};`,

    ol: `padding-left: 1em; margin-left: 0; color: ${fg};`,

    li: `display: block; margin: 0.2em 8px; color: ${fg};`,

    strong: `color: ${primaryColor}; font-weight: bold; font-size: inherit;`,

    em: `font-style: italic; font-size: inherit;`,

    hr: `border: none; border-top: 2px solid rgba(0,0,0,0.1); -webkit-transform-origin: 0 0; -webkit-transform: scale(1, 0.5); transform-origin: 0 0; transform: scale(1, 0.5); height: 0.4em; margin: 1.5em 0;`,

    codespan: `font-family: Menlo, Monaco, 'Courier New', monospace; font-size: 90%; color: #d14; background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px;`,

    pre: `font-size: 90%; overflow-x: auto; border-radius: 8px; line-height: 1.5; margin: 10px 8px; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); padding: 0 !important;`,

    codeInPre: `display: -webkit-box; padding: 0.5em 1em 1em; overflow-x: auto; text-indent: 0; color: #24292e; background: none; white-space: nowrap; margin: 0; font-family: Menlo, Monaco, 'Courier New', monospace; font-size: 90%; border-radius: 4px;`,

    th: `border: 1px solid #dfdfdf; padding: 0.25em 0.5em; color: ${fg}; word-break: keep-all; background: rgba(0,0,0,0.05); font-weight: bold;`,

    td: `border: 1px solid #dfdfdf; padding: 0.25em 0.5em; color: ${fg}; word-break: keep-all;`,

    table: `border-collapse: collapse; margin: 1em 0; font-size: 14px; color: ${fg};`,

    a: `color: #576b95; text-decoration: none;`,

    img: `display: block; max-width: 100%; margin: 0.1em auto 0.5em; border-radius: 4px; height: auto;`,

    figcaption: `text-align: center; color: #888; font-size: 0.8em;`,

    footnotes: `margin: 0.5em 8px; font-size: 80%; color: ${fg};`,
  };
}
