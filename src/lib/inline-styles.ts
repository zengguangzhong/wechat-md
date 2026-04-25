import type { StyleConfig } from './types';

/**
 * 解析 HSL 字符串为 HEX
 * 支持格式: "0 0% 3.9%" 或 "0, 0%, 3.9%"
 */
function parseHslToHex(hslStr: string): string {
  const parts = hslStr.replace(/,/g, '').split(/\s+/);
  if (parts.length < 3) return '#0c0c0c';
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]);
  const l = parseFloat(parts[2]);
  if (isNaN(h) || isNaN(s) || isNaN(l)) return '#0c0c0c';
  // HSL to RGB
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 将 HEX 颜色转换为 rgba，支持 3位/6位 HEX
 * @param hex 如 #0F4C81 或 #fff
 * @param alpha 0-1 之间的小数
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  let r: number, g: number, b: number;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// highlight.js 代码高亮颜色方案（github-light 风格 - 浅色背景）
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

// 科技主题深色代码高亮配色（适合深色背景）
const CODE_HIGHLIGHT_STYLES_DARK: Record<string, string> = {
  'hljs-comment': 'color: #8B949E; font-style: italic;',
  'hljs-quote': 'color: #8B949E; font-style: italic;',
  'hljs-keyword': 'color: #FF7B72;',
  'hljs-selector-tag': 'color: #7EE787;',
  'hljs-built_in': 'color: #79C0FF;',
  'hljs-type': 'color: #FF7B72;',
  'hljs-literal': 'color: #79C0FF;',
  'hljs-number': 'color: #79C0FF;',
  'hljs-regexp': 'color: #A5D6FF;',
  'hljs-string': 'color: #A5D6FF;',
  'hljs-subst': 'color: #E8E2DC;',
  'hljs-symbol': 'color: #79C0FF;',
  'hljs-class': 'color: #D2A8FF;',
  'hljs-function': 'color: #D2A8FF;',
  'hljs-title': 'color: #D2A8FF;',
  'hljs-params': 'color: #E8E2DC;',
  'hljs-bullet': 'color: #FFA657;',
  'hljs-meta': 'color: #C9D1D9;',
  'hljs-meta-keyword': 'color: #C9D1D9;',
  'hljs-meta-string': 'color: #A5D6FF;',
  'hljs-section': 'color: #79C0FF; font-weight: bold;',
  'hljs-tag': 'color: #7EE787;',
  'hljs-name': 'color: #7EE787;',
  'hljs-attr': 'color: #D2A8FF;',
  'hljs-attribute': 'color: #79C0FF;',
  'hljs-variable': 'color: #FFA657;',
  'hljs-variable.language_': 'color: #79C0FF;',
  'hljs-deletion': 'color: #FFDCD7; background-color: rgba(255, 0, 0, 0.2);',
  'hljs-addition': 'color: #AFF5B4; background-color: rgba(0, 255, 0, 0.2);',
  'hljs-operator': 'color: #FF7B72;',
  'hljs-punctuation': 'color: #C9D1D9;',
  'hljs-property': 'color: #79C0FF;',
  'hljs-selector-class': 'color: #D2A8FF;',
  'hljs-selector-id': 'color: #79C0FF;',
};

/**
 * 为 HTML 中的 highlight.js span 元素内联颜色样式
 * 支持单 class 和多 class（空格分隔）
 * @param html HTML 字符串
 * @param theme 主题名称，可选，用于选择代码高亮配色方案
 */
export function inlineCodeHighlightStyles(html: string, theme?: string): string {
  // 根据主题选择配色方案
  const styles = theme === 'tech' ? CODE_HIGHLIGHT_STYLES_DARK : CODE_HIGHLIGHT_STYLES;

  let output = html;
  for (const [className, style] of Object.entries(styles)) {
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

function buildTechStyles(
  primaryColor: string,
  fontFamily: string,
  fontSize: string,
  fg: string,
  blockquoteBackground: string,
  containerBg: string,
  accentColor: string
) {
  return {
    container: `font-family: ${fontFamily}; font-size: ${fontSize}; line-height: 1.8; text-align: left; ${containerBg !== 'transparent' ? `background: ${containerBg};` : ''} padding: 0 10px;`,

    h1: `color: #C45D1A; font-size: 24px; font-weight: 800; line-height: 1.3; border-bottom: 2.5px solid ${accentColor}; padding-bottom: 11px; margin: 0 0 24px 0;`,

    h2: `color: #B04F12; font-size: 20px; font-weight: 700; line-height: 1.38; margin: 28px auto 14px auto; text-align: center;`,

    h3: `color: #8B3D0E; font-size: 16px; font-weight: 600; line-height: 1.45; margin: 20px 0 10px 0;`,

    h4: `color: ${primaryColor}; font-size: 16px; font-weight: bold; margin: 16px 0 8px 0;`,

    h5: `color: ${primaryColor}; font-size: 15px; font-weight: bold; margin: 14px 0 6px 0;`,

    h6: `color: ${primaryColor}; font-size: 14px; font-weight: bold; margin: 12px 0 4px 0;`,

    p: `color: ${fg}; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0; text-align: justify;`,

    blockquote: `border-left: 3px solid ${accentColor}; background: ${blockquoteBackground}; color: #6B4A2F; font-style: normal; padding: 10px 10px 10px 14px; margin: 12px 0; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6;`,

    blockquoteP: `color: #6B4A2F; margin: 0;`,

    ul: `list-style: disc; padding-left: 24px; margin: 10px 0 12px 0; color: ${fg};`,

    ol: `list-style: decimal; padding-left: 24px; margin: 10px 0 12px 0; color: ${fg};`,

    li: `margin-bottom: 5px; color: ${fg};`,

    strong: `color: #C45D1A; font-weight: 700;`,

    em: `font-style: italic; color: #B04F12;`,

    hr: `border: none; border-top: 1px solid #F0E8E0; margin: 16px 0;`,

    codespan: `background: #FDF1E6; color: #B04F12; padding: 2px 7px; border-radius: 5px; font-size: 14px;`,

    pre: `background: #1E1B18; border-radius: 12px; padding: 12px; margin: 20px 0; font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace; font-size: 13px; overflow-x: auto;`,

    codeInPre: `color: #E8E2DC; background: transparent;`,

    thead: `font-weight: bold; color: ${fg};`,

    th: `background: #D97A35; color: #ffffff; padding: 13px 16px; font-weight: 600; border-bottom: none; text-align: left;`,

    td: `padding: 12px 16px; border-bottom: none; color: ${fg};`,

    table: `border-collapse: collapse; width: 100%; border-radius: 8px; overflow: hidden; margin: 24px 0;`,

    a: `color: ${primaryColor}; border-bottom: 1px solid rgba(232, 138, 60, 0.27); text-decoration: none;`,

    img: `display: block; max-width: 100%; border-radius: 8px; margin: 16px 0;`,

    figcaption: `text-align: center; color: #888; font-size: 0.8em;`,

    footnotes: `font-size: 12px; color: #8B7355; border-top: 1px solid #F0E8E0; padding-top: 16px; margin: 24px 0 0 0;`,

    alertNote: `background: #FEF9F3; border-left-color: ${primaryColor};`,
    alertTip: `background: #F3F8F4; border-left-color: #6DB87A;`,
    alertImportant: `background: #FDF1E6; border-left-color: #E88A3C;`,
    alertWarning: `background: #FFF8E7; border-left-color: #F5A623;`,
    alertCaution: `background: #FFF0F0; border-left-color: #E85C5C;`,

    figure: `margin: 16px 0;`,

    katexInline: `max-width: 100%; overflow-x: auto;`,
    katexBlock: `max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 0.5em 0; text-align: center;`,

    markupHighlight: `background-color: ${primaryColor}; padding: 2px 4px; border-radius: 4px; color: #fff;`,
    markupUnderline: `text-decoration: underline; text-decoration-color: ${primaryColor};`,
    markupWavyline: `text-decoration: underline wavy; text-decoration-color: ${primaryColor}; text-decoration-thickness: 2px;`,
  };
}

function buildGrowthStyles(
  _primaryColor: string,
  fontFamily: string,
  fontSize: string,
  fg: string,
  _blockquoteBackground: string,
  containerBg: string
) {
  // 成长主题使用固定的绿色配色，不受用户选择的颜色影响
  const primaryColor = '#6DB87A';
  const accentColor = '#8FCCA0';
  const blockquoteBackground = '#F3F8F4';

  return {
    container: `font-family: ${fontFamily}; font-size: ${fontSize}; line-height: 1.8; text-align: left; ${containerBg !== 'transparent' ? `background: ${containerBg};` : ''} padding: 0 12px;`,

    h1: `color: ${fg}; font-size: 26px; font-weight: 700; line-height: 1.3; margin: 0 0 24px 0;`,

    h2: `color: #4A7A52; font-size: 20px; font-weight: 600; line-height: 1.42; margin: 28px auto 16px auto; text-align: center;`,

    h3: `color: #5A8A62; font-size: 16px; font-weight: 600; line-height: 1.48; margin: 20px 0 10px 0;`,

    h4: `color: ${primaryColor}; font-size: 16px; font-weight: bold; margin: 16px 0 8px 0;`,

    h5: `color: ${primaryColor}; font-size: 15px; font-weight: bold; margin: 14px 0 6px 0;`,

    h6: `color: ${primaryColor}; font-size: 14px; font-weight: bold; margin: 12px 0 4px 0;`,

    p: `color: ${fg}; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0; text-align: justify;`,

    blockquote: `border-left: 3px solid ${primaryColor}; background: ${blockquoteBackground}; color: #4A5A42; font-style: italic; padding: 10px 10px 10px 14px; margin: 12px 0; border-radius: 0 8px 8px 0; font-size: 16px; line-height: 1.6;`,

    blockquoteP: `color: #4A5A42; margin: 0;`,

    ul: `list-style: disc; padding-left: 24px; margin: 12px 0; color: ${fg};`,

    ol: `list-style: decimal; padding-left: 24px; margin: 12px 0; color: ${fg};`,

    li: `margin-bottom: 8px; color: ${fg};`,

    strong: `color: ${fg}; font-weight: 700;`,

    em: `font-style: italic; color: #4A7A52;`,

    hr: `border: none; border-top: 1px solid #E0E8E2; margin: 16px 0;`,

    codespan: `background: #EDF5EE; color: ${fg}; padding: 2px 7px; border-radius: 4px; font-size: 14px;`,

    pre: `background: #EDF5EE; border-radius: 8px; padding: 12px; margin: 20px 0; font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace; font-size: 13px; overflow-x: auto;`,

    codeInPre: `color: ${fg}; background: transparent;`,

    thead: `font-weight: bold; color: ${fg};`,

    th: `background: #5A8A62; color: #ffffff; padding: 12px 16px; font-weight: 600; border-bottom: none; text-align: left;`,

    td: `padding: 12px 16px; border-bottom: none; color: ${fg};`,

    table: `border-collapse: collapse; width: 100%; border-radius: 6px; overflow: hidden; margin: 24px 0;`,

    a: `color: #4A7A52; border-bottom: 1px solid rgba(109, 184, 122, 0.27); text-decoration: none;`,

    img: `display: block; max-width: 100%; border-radius: 6px; margin: 16px 0;`,

    figcaption: `text-align: center; color: #888; font-size: 0.8em;`,

    footnotes: `font-size: 13px; color: #6B7A6B; border-top: 1px solid #E0E8E2; padding-top: 18px; margin: 24px 0 0 0;`,

    alertNote: `background: #F3F8F4; border-left-color: ${primaryColor};`,
    alertTip: `background: #F0F7F1; border-left-color: ${accentColor};`,
    alertImportant: `background: #F5F8F5; border-left-color: ${primaryColor};`,
    alertWarning: `background: #FDF8E7; border-left-color: #E8C547;`,
    alertCaution: `background: #FFF0F0; border-left-color: #E85C5C;`,

    figure: `margin: 16px 0;`,

    katexInline: `max-width: 100%; overflow-x: auto;`,
    katexBlock: `max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 0.5em 0; text-align: center;`,

    markupHighlight: `background-color: ${primaryColor}; padding: 2px 4px; border-radius: 4px; color: #fff;`,
    markupUnderline: `text-decoration: underline; text-decoration-color: ${primaryColor};`,
    markupWavyline: `text-decoration: underline wavy; text-decoration-color: ${primaryColor}; text-decoration-thickness: 2px;`,
  };
}

/**
 * 构建主题样式字符串，直接内联到元素上
 * 不使用 CSS 变量 + juice，直接生成内联样式
 */
export function buildInlineStyles(style: StyleConfig) {
  const { primaryColor, fontFamily, fontSize, foreground, blockquoteBackground, containerBg, accentColor, theme } = style;
  // Convert HSL foreground to hex
  const fg = foreground.includes('%') ? parseHslToHex(foreground) : foreground;

  switch (theme) {
    case 'tech':
      return buildTechStyles(primaryColor, fontFamily, fontSize, fg, blockquoteBackground, containerBg, accentColor || '#F5A65A');
    case 'growth':
    default:
      return buildGrowthStyles(primaryColor, fontFamily, fontSize, fg, blockquoteBackground, containerBg);
  }
}
