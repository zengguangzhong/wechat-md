"use client";

import hljs from 'highlight.js/lib/core';
import type { LanguageFn } from 'highlight.js';
import { marked, type RendererObject, type Tokens } from 'marked';
import type { ReadTimeResults } from 'reading-time';
import readingTime from 'reading-time';

import { macCodeSvg, copyButtonSvg } from './constants';
import type { ConvertOptions, ParseResult, StyleConfig } from './types';
import { buildInlineStyles, inlineCodeHighlightStyles } from './inline-styles';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Register commonly used languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import ruby from 'highlight.js/lib/languages/ruby';
import php from 'highlight.js/lib/languages/php';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import nginx from 'highlight.js/lib/languages/nginx';
import diff from 'highlight.js/lib/languages/diff';

const languages: Record<string, LanguageFn> = {
  javascript, typescript, python, java, c, cpp, go, rust, ruby, php,
  swift, kotlin, sql, bash, shell, json, yaml, xml, css, scss,
  markdown, plaintext, dockerfile, nginx, diff,
};

Object.entries(languages).forEach(([name, lang]) => {
  hljs.registerLanguage(name, lang);
});

marked.setOptions({ breaks: true });

function parseFrontMatterAndContent(markdownText: string): ParseResult {
  try {
    // Simple front-matter parser (no external dependency)
    const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = markdownText.match(fmRegex);
    if (match) {
      const yamlText = match[1];
      const body = match[2];
      const yamlData: Record<string, unknown> = {};
      yamlText.split('\n').forEach((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          const value = line.slice(colonIdx + 1).trim();
          yamlData[key] = value;
        }
      });
      const readingTimeResult = readingTime(body);
      return { yamlData, markdownContent: body, readingTime: readingTimeResult };
    }
    const readingTimeResult = readingTime(markdownText);
    return { yamlData: {}, markdownContent: markdownText, readingTime: readingTimeResult };
  } catch {
    return {
      yamlData: {},
      markdownContent: markdownText,
      readingTime: readingTime(markdownText),
    };
  }
}

function transform(legend: string, text: string | null, title: string | null): string {
  const options = legend.split('-');
  for (const option of options) {
    if (option === 'alt' && text) return text;
    if (option === 'title' && title) return title;
  }
  return '';
}

function formatHighlightedCode(html: string, preserveNewlines = false): string {
  let formatted = html;
  formatted = formatted.replace(
    /(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g,
    (_: string, span1: string, spaces: string, span2: string) =>
      span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`)
  );
  formatted = formatted.replace(
    /(\s+)(<span[^>]*>)/g,
    (_: string, spaces: string, span: string) =>
      span.replace(/^(<span[^>]*>)/, `$1${spaces}`)
  );
  formatted = formatted.replace(/\t/g, '    ');
  if (preserveNewlines) {
    formatted = formatted
      .replace(/\r\n/g, '<br/>')
      .replace(/\n/g, '<br/>')
      .replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, '&nbsp;'));
  } else {
    formatted = formatted.replace(
      /(>[^<]+)|(^[^<]+)/g,
      (str) => str.replace(/\s/g, '&nbsp;')
    );
  }
  return formatted;
}

function highlightAndFormatCode(
  text: string, language: string, showLineNumber: boolean
): string {
  if (showLineNumber) {
    const rawLines = text.replace(/\r\n/g, '\n').split('\n');
    const highlightedLines = rawLines.map((lineRaw) => {
      const lineHtml = hljs.highlight(lineRaw, { language }).value;
      const formatted = formatHighlightedCode(lineHtml, false);
      return formatted === '' ? '&nbsp;' : formatted;
    });
    const lineNumbersHtml = highlightedLines
      .map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75;user-select:none">${idx + 1}</section>`)
      .join('');
    const codeInnerHtml = highlightedLines.join('<br/>');
    const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
    return `
      <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
        <section style="text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none">${lineNumbersHtml}</section>
        <section style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
      </section>`;
  } else {
    const rawHighlighted = hljs.highlight(text, { language }).value;
    return formatHighlightedCode(rawHighlighted, true);
  }
}

export function renderMarkdown(
  markdown: string,
  options: ConvertOptions,
  styleConfig: StyleConfig
): { html: string; title: string; readingTime: ReadTimeResults } {
  const { yamlData, markdownContent, readingTime: readingTimeResult } =
    parseFrontMatterAndContent(markdown);

  const title = (yamlData.title as string | undefined) || '';
  const s = buildInlineStyles(styleConfig);

  const footnotes: [number, string, string][] = [];
  let footnoteIndex = 0;
  const listOrderedStack: boolean[] = [];
  const listCounters: number[] = [];

  // Markdown footnotes: [^1] -> sup link, [^1]: text -> definition
  const mdFootnotes = new Map<string, string>();
  const mdFootnoteRefs: [string, number][] = [];
  let mdFootnoteCounter = 0;

  function addFootnote(title: string, link: string): number {
    const existing = footnotes.find(([, , l]) => l === link);
    if (existing) return existing[0];
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  }

  function buildReadingTime(): string {
    if (!options.showReadingTime || !readingTimeResult.words) return '';
    return `<blockquote style="${s.blockquote}"><p style="${s.blockquoteP}">字数 ${readingTimeResult.words}，阅读大约需 ${Math.ceil(readingTimeResult.minutes)} 分钟</p></blockquote>`;
  }

  function buildFootnotes(): string {
    if (!footnotes.length) return '';
    const items = footnotes
      .map(([idx, t, link]) =>
        link === t
          ? `<code style="font-size:90%;opacity:0.6">[${idx}]</code>: <i style="word-break:break-all">${t}</i><br/>`
          : `<code style="font-size:90%;opacity:0.6">[${idx}]</code> ${t}: <i style="word-break:break-all">${link}</i><br/>`
      )
      .join('\n');
    return `<h4 style="${s.h4}">引用链接</h4><p style="${s.footnotes}">${items}</p>`;
  }

  const renderer: RendererObject = {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens);
      const tag = `h${depth}`;
      const headingAttr = ' data-heading="true"';
      const styleMap: Record<string, string> = {
        h1: s.h1, h2: s.h2, h3: s.h3, h4: s.h4, h5: s.h5, h6: s.h6,
      };
      return `<${tag} class="h${depth}"${headingAttr} style="${styleMap[tag] || s.h1}">${text}</${tag}>`;
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens);
      if (text.includes('<figure') && text.includes('<img')) return text;
      if (text.trim() === '') return text;
      return `<p style="${s.p}">${text}</p>`;
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens);
      // Check for GitHub-style alerts: > [!NOTE], > [!WARNING], etc.
      const alertMatch = text.match(/<p style="[^"]*">\s*\[!([A-Z]+)\]\s*(.*?)<\/p>/);
      if (alertMatch) {
        const alertType = alertMatch[1].toLowerCase() as 'note' | 'tip' | 'important' | 'warning' | 'caution';
        const alertTitle = alertMatch[2].trim();
        const alertStyles: Record<string, string> = {
          note: s.alertNote,
          tip: s.alertTip,
          important: s.alertImportant,
          warning: s.alertWarning,
          caution: s.alertCaution,
        };
        const alertStyle = alertStyles[alertType] || s.alertNote;
        const alertLabel = alertTitle || alertType.toUpperCase();
        const remaining = text.replace(alertMatch[0], '').replace(/^\s*<p style="[^"]*">\s*<\/p>\s*/, '');
        return `<blockquote style="${s.blockquote};${alertStyle}"><p style="${s.blockquoteP}"><strong>${escapeHtml(alertLabel)}</strong></p>${remaining}</blockquote>`;
      }
      // Replace blockquote > p styles
      const styled = text.replace(/<p style="[^"]*">/g, `<p style="${s.blockquoteP}">`);
      return `<blockquote style="${s.blockquote}">${styled}</blockquote>`;
    },

    code({ text, lang = '' }: Tokens.Code): string {
      const langText = lang.split(' ')[0];
      const isLanguageRegistered = hljs.getLanguage(langText);
      const language = isLanguageRegistered ? langText : 'plaintext';

      const highlighted = highlightAndFormatCode(text, language, !!options.showLineNumber);
      const styledHighlighted = inlineCodeHighlightStyles(highlighted, styleConfig.theme);

      const macSignStyle = options.macCodeBlock !== false ? 'display:flex' : 'display:none';
      const span = `<span class="mac-sign" style="${macSignStyle};padding:10px 14px 0">${macCodeSvg}</span>`;
      const copyBtn = `<span class="code-copy-btn" data-code="${encodeURIComponent(text)}" style="position:absolute;top:8px;right:8px;padding:4px 8px;background:rgba(255,255,255,0.1);border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;opacity:0.7;transition:opacity 0.2s">${copyButtonSvg}<span style="color:#E8E2DC">复制</span></span>`;
      const code = `<code class="language-${lang}" style="${s.codeInPre}">${styledHighlighted}</code>`;
      return `<pre class="hljs code__pre" style="${s.pre};position:relative">${span}${copyBtn}${code}</pre>`;
    },

    codespan({ text }: Tokens.Codespan): string {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<code style="${s.codespan}">${escaped}</code>`;
    },

    list({ ordered, items, start = 1 }: Tokens.List) {
      listOrderedStack.push(ordered);
      listCounters.push(Number(start));
      const html = items.map((item) => this.listitem(item)).join('');
      listOrderedStack.pop();
      listCounters.pop();
      const tag = ordered ? 'ol' : 'ul';
      const listStyle = ordered ? s.ol : s.ul;
      return `<${tag} style="${listStyle}">${html}</${tag}>`;
    },

    listitem(token: Tokens.ListItem) {
      const ordered = listOrderedStack[listOrderedStack.length - 1];
      const idx = listCounters[listCounters.length - 1]!;
      listCounters[listCounters.length - 1] = idx + 1;
      const prefix = ordered ? `${idx}. ` : '• ';
      let content: string;
      try {
        content = this.parser.parseInline(token.tokens);
      } catch {
        content = this.parser
          .parse(token.tokens)
          .replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, '$1');
      }
      return `<li style="${s.li}">${prefix}${content}</li>`;
    },

    image({ href, title, text }: Tokens.Image): string {
      const newText = options.legend ? transform(options.legend, text, title) : '';
      const subText = newText ? `<p style="${s.figcaption}">${escapeHtml(newText)}</p>` : '';
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<figure style="margin:1.5em 8px"><img src="${escapeHtml(href)}"${titleAttr} alt="${escapeHtml(text)}" style="${s.img}"/>${subText}</figure>`;
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens);
      const safeHref = escapeHtml(href);
      const safeTitle = escapeHtml(title || text);
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
        return `<a href="${safeHref}" title="${safeTitle}" style="${s.a}">${parsedText}</a>`;
      }
      if (href === text) return parsedText;
      if (options.citeLinks) {
        const ref = addFootnote(title || text, href);
        return `<a href="${safeHref}" title="${safeTitle}" style="${s.a}">${parsedText}<sup>[${ref}]</sup></a>`;
      }
      return `<a href="${safeHref}" title="${safeTitle}" style="${s.a}">${parsedText}</a>`;
    },

    strong({ tokens }: Tokens.Strong): string {
      return `<strong style="${s.strong}">${this.parser.parseInline(tokens)}</strong>`;
    },

    em({ tokens }: Tokens.Em): string {
      return `<em style="${s.em}">${this.parser.parseInline(tokens)}</em>`;
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header
        .map((cell) => {
          const text = this.parser.parseInline(cell.tokens);
          return `<th style="${s.th}">${text}</th>`;
        })
        .join('');
      const body = rows
        .map((row) => {
          const rowContent = row.map((cell) => {
            const text = this.parser.parseInline(cell.tokens);
            return `<td style="${s.td}">${text}</td>`;
          }).join('');
          return `<tr>${rowContent}</tr>`;
        })
        .join('');
      return `<section style="max-width:100%;overflow:auto"><table style="${s.table}"><thead>${headerRow}</thead><tbody>${body}</tbody></table></section>`;
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens);
      return `<td style="${s.td}">${text}</td>`;
    },

    hr() {
      return `<hr style="${s.hr}"/>`;
    },
  };

  // Pre-process markdown footnotes: extract definitions and references
  const footnoteDefRegex = /^\[(\^[^\]]+)\]:\s*(.*)$/gm;
  let footnoteDefMatch;
  while ((footnoteDefMatch = footnoteDefRegex.exec(markdownContent)) !== null) {
    mdFootnotes.set(footnoteDefMatch[1], footnoteDefMatch[2]);
  }
  let processedMarkdown = markdownContent.replace(/^\[(\^[^\]]+)\]:\s*.*$/gm, '');

  // Replace [^label] with placeholders
  processedMarkdown = processedMarkdown.replace(/\[(\^[^\]]+)\]/g, (match, label) => {
    if (!mdFootnotes.has(label)) return match;
    const existing = mdFootnoteRefs.find(([l]) => l === label);
    if (existing) {
      return `{{FNREF:${existing[1]}}}`;
    }
    mdFootnoteCounter++;
    mdFootnoteRefs.push([label, mdFootnoteCounter]);
    return `{{FNREF:${mdFootnoteCounter}}}`;
  });

  marked.use({ renderer });

  let html = marked.parse(processedMarkdown) as string;
  html = buildReadingTime() + html;
  html += buildFootnotes();

  // Replace footnote placeholders with actual HTML
  html = html.replace(/\{\{FNREF:(\d+)\}\}/g, '<sup style="font-size:75%;color:#576b95">[$1]</sup>');

  // Append markdown footnotes section
  if (mdFootnoteRefs.length > 0) {
    const mdFnItems = mdFootnoteRefs
      .map(([label, num]) => {
        const content = mdFootnotes.get(label) || '';
        return `<code style="font-size:90%;opacity:0.6">[${num}]</code> ${escapeHtml(content)}<br/>`;
      })
      .join('\n');
    html += `<h4 style="${s.h4}">脚注</h4><p style="${s.footnotes}">${mdFnItems}</p>`;
  }

  // h2 strong should inherit white color (h2 background is primaryColor, text is white)
  html = html.replace(/<h2\b[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/h2>/g, (match, style, content) => {
    const newContent = content.replace(/<strong style="[^"]*"/g, '<strong style="color:#fff;font-weight:bold;font-size:inherit;"');
    return match.replace(content, newContent);
  });

  // Remove first heading if keepTitle is false
  if (!options.keepTitle) {
    html = html.replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>/, '');
  }

  // Wrap in container
  html = `<section class="container" style="${s.container}">${html}</section>`;

  return { html, title, readingTime: readingTimeResult };
}
