import fs from 'fs';
import path from 'path';
import type { ThemeName } from '../types';

const themesDir = path.join(process.cwd(), 'src/lib/themes');

export function loadThemeCss(theme: ThemeName): { baseCss: string; themeCss: string } {
  const baseCss = fs.readFileSync(path.join(themesDir, 'base.css'), 'utf-8');

  const themeCssMap: Record<ThemeName, string[]> = {
    default: ['default.css'],
    grace: ['default.css', 'grace.css'],
    simple: ['default.css', 'simple.css'],
    modern: ['modern.css'],
  };

  const files = themeCssMap[theme] || ['default.css'];
  const themeCss = files.map(f => fs.readFileSync(path.join(themesDir, f), 'utf-8')).join('\n');

  return { baseCss, themeCss };
}
