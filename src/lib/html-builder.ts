import type { StyleConfig } from './types';
import { DEFAULT_STYLE } from './constants';

export function buildCss(
  baseCss: string,
  themeCss: string,
  style: StyleConfig = DEFAULT_STYLE
): string {
  const variables = `
:root {
  --md-primary-color: ${style.primaryColor};
  --md-font-family: ${style.fontFamily};
  --md-font-size: ${style.fontSize};
  --foreground: ${style.foreground};
  --blockquote-background: ${style.blockquoteBackground};
  --md-accent-color: ${style.accentColor};
  --md-container-bg: ${style.containerBg};
}

body {
  margin: 0;
  padding: 24px;
  background: #ffffff;
}

#output {
  max-width: 860px;
  margin: 0 auto;
}
`.trim();

  return [variables, baseCss, themeCss].join('\n\n');
}

export async function inlineCss(html: string): Promise<string> {
  try {
    const { default: juice } = await import('juice');
    return juice(html, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Missing dependency "juice" for CSS inlining. Original error: ${detail}`
    );
  }
}

export function normalizeCssText(
  cssText: string,
  style: StyleConfig = DEFAULT_STYLE
): string {
  return cssText
    .replace(/var\(--md-primary-color\)/g, style.primaryColor)
    .replace(/var\(--md-font-family\)/g, style.fontFamily)
    .replace(/var\(--md-font-size\)/g, style.fontSize)
    .replace(/var\(--blockquote-background\)/g, style.blockquoteBackground)
    .replace(/var\(--md-accent-color\)/g, style.accentColor)
    .replace(/var\(--md-container-bg\)/g, style.containerBg)
    .replace(/hsl\(var\(--foreground\)\)/g, '#3f3f3f')
    .replace(/--md-primary-color:\s*[^;]+;?/g, '')
    .replace(/--md-font-family:\s*[^;]+;?/g, '')
    .replace(/--md-font-size:\s*[^;]+;?/g, '')
    .replace(/--blockquote-background:\s*[^;]+;?/g, '')
    .replace(/--md-accent-color:\s*[^;]+;?/g, '')
    .replace(/--md-container-bg:\s*[^;]+;?/g, '')
    .replace(/--foreground:\s*[^;]+;?/g, '');
}

export function normalizeInlineCss(
  html: string,
  style: StyleConfig = DEFAULT_STYLE
): string {
  let output = html;
  // Replace CSS variables in <style> tags
  output = output.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (_match, attrs: string, cssText: string) =>
      `<style${attrs}>${normalizeCssText(cssText, style)}</style>`
  );
  // Replace CSS variables in style="..." attributes (double quotes)
  output = output.replace(
    /style="([^"]*)"/gi,
    (_match, cssText: string) => `style="${normalizeCssText(cssText, style)}"`
  );
  // Replace CSS variables in style='...' attributes (single quotes)
  output = output.replace(
    /style='([^']*)'/gi,
    (_match, cssText: string) => `style='${normalizeCssText(cssText, style)}'`
  );
  return output;
}

export function removeStyleTags(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
}

export function modifyHtmlStructure(htmlString: string): string {
  let output = htmlString;
  const pattern =
    /<li([^>]*)>([\s\S]*?)(<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>)<\/li>/i;
  while (pattern.test(output)) {
    output = output.replace(pattern, '<li$1>$2</li>$3');
  }
  return output;
}
