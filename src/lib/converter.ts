import { renderMarkdown } from './renderer';
import { loadThemeCss } from './themes';
import {
  buildCss,
  normalizeInlineCss,
  inlineCss,
  removeStyleTags,
} from './html-builder';
import {
  DEFAULT_STYLE,
  THEME_STYLE_DEFAULTS,
  COLOR_PRESETS,
  FONT_FAMILY_MAP,
} from './constants';
import type { ConvertOptions, StyleConfig } from './types';

export async function convertToWechatHtml(
  markdown: string,
  options: ConvertOptions
): Promise<string> {
  // 1. Resolve primary color
  const primaryColor = options.primaryColor
    ? COLOR_PRESETS[options.primaryColor] ?? options.primaryColor
    : undefined;

  // 2. Resolve font family
  const fontFamily = options.fontFamily
    ? FONT_FAMILY_MAP[options.fontFamily] ?? options.fontFamily
    : undefined;

  // 3. Build style config
  const themeDefaults = THEME_STYLE_DEFAULTS[options.theme] || {};
  const style: StyleConfig = {
    ...DEFAULT_STYLE,
    ...themeDefaults,
    ...(primaryColor ? { primaryColor } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(options.fontSize ? { fontSize: options.fontSize } : {}),
  };

  // 4. Load theme CSS
  const { baseCss, themeCss } = loadThemeCss(options.theme);
  const fullCss = buildCss(baseCss, themeCss, style);

  // 5. Render Markdown
  const { html: rawHtml } = renderMarkdown(markdown, options);

  // 6. Assemble full HTML with CSS
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${fullCss}</style></head><body>${rawHtml}</body></html>`;

  // 7. Inline CSS with juice
  let inlinedHtml = await inlineCss(fullHtml);

  // 8. Replace remaining CSS variables
  inlinedHtml = normalizeInlineCss(inlinedHtml, style);

  // 9. Remove style tags
  inlinedHtml = removeStyleTags(inlinedHtml);

  // 10. Extract body content
  const bodyMatch = inlinedHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : inlinedHtml;
}
