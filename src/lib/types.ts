import type { ReadTimeResults } from 'reading-time';

export type ThemeName = 'default' | 'grace' | 'simple' | 'modern';

export interface ParseResult {
  yamlData: Record<string, any>;
  markdownContent: string;
  readingTime: ReadTimeResults;
}

export interface StyleConfig {
  primaryColor: string;
  fontFamily: string;
  fontSize: string;
  foreground: string;
  blockquoteBackground: string;
  accentColor: string;
  containerBg: string;
}

export interface ConvertOptions {
  theme: ThemeName;
  primaryColor?: string;
  fontFamily?: string;
  fontSize?: string;
  codeTheme?: string;
  macCodeBlock?: boolean;
  showLineNumber?: boolean;
  citeLinks?: boolean;
  showReadingTime?: boolean;
  keepTitle?: boolean;
  legend?: string;
}
