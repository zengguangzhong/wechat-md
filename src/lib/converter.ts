import { renderMarkdown } from './renderer';
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
    theme: options.theme,
    ...(primaryColor ? { primaryColor } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(options.fontSize ? { fontSize: options.fontSize } : {}),
    ...(options.colorLightness !== undefined ? { colorLightness: options.colorLightness } : {}),
  };

  // 4. Render with inline styles
  const { html } = renderMarkdown(markdown, options, style);

  return html;
}
