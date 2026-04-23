import frontMatter from 'front-matter';
import hljs from 'highlight.js/lib/core';
import { marked, type RendererObject, type Tokens } from 'marked';
import readingTime from 'reading-time';

import { macCodeSvg } from './constants';
import type { ConvertOptions, ParseResult, StyleConfig } from './types';
import { buildInlineStyles, inlineCodeHighlightStyles } from './inline-styles';

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

const languages: Record<string, any> = {
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
    const parsed = frontMatter(markdownText);
    const yamlData = parsed.attributes as Record<string, any>;
    const markdownContent = parsed.body;
    const readingTimeResult = readingTime(markdownContent);
    return { yamlData, markdownContent, readingTime: readingTimeResult };
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
): { html: string; title: string; readingTime: any } {
  const { yamlData, markdownContent, readingTime: readingTimeResult } =
    parseFrontMatterAndContent(markdown);

  const title = yamlData.title || '';
  const s = buildInlineStyles(styleConfig);

  const footnotes: [number, string, string][] = [];
  let footnoteIndex = 0;
  const listOrderedStack: boolean[] = [];
  const listCounters: number[] = [];

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
      // Replace blockquote > p styles
      const styled = text.replace(/<p style="[^"]*">/g, `<p style="${s.blockquoteP}">`);
      return `<blockquote style="${s.blockquote}">${styled}</blockquote>`;
    },

    code({ text, lang = '' }: Tokens.Code): string {
      const langText = lang.split(' ')[0];
      const isLanguageRegistered = hljs.getLanguage(langText);
      const language = isLanguageRegistered ? langText : 'plaintext';

      const highlighted = highlightAndFormatCode(text, language, !!options.showLineNumber);
      const styledHighlighted = inlineCodeHighlightStyles(highlighted);

      const macSignStyle = options.macCodeBlock !== false ? 'display:flex' : 'display:none';
      const span = `<span class="mac-sign" style="${macSignStyle};padding:10px 14px 0">${macCodeSvg}</span>`;
      let pendingAttr = '';
      if (!isLanguageRegistered && langText !== 'plaintext') {
        const escapedText = text.replace(/"/g, '&quot;');
        pendingAttr = ` data-language-pending="${langText}" data-raw-code="${escapedText}"`;
      }
      const code = `<code class="language-${lang}" style="${s.codeInPre}"${pendingAttr}>${styledHighlighted}</code>`;
      return `<pre class="hljs code__pre" style="${s.pre}">${span}${code}</pre>`;
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
      const subText = newText ? `<p style="${s.figcaption}">${newText}</p>` : '';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<figure style="margin:1.5em 8px"><img src="${href}"${titleAttr} alt="${text}" style="${s.img}"/>${subText}</figure>`;
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens);
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
        return `<a href="${href}" title="${title || text}" style="${s.a}">${parsedText}</a>`;
      }
      if (href === text) return parsedText;
      if (options.citeLinks) {
        const ref = addFootnote(title || text, href);
        return `<a href="${href}" title="${title || text}" style="${s.a}">${parsedText}<sup>[${ref}]</sup></a>`;
      }
      return `<a href="${href}" title="${title || text}" style="${s.a}">${parsedText}</a>`;
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

  marked.use({ renderer });

  let html = marked.parse(markdownContent) as string;
  html = buildReadingTime() + html;
  html += buildFootnotes();

  // h2 strong should inherit white color
  html = html.replace(/<h2[^>]*>/g, (match) => {
    if (match.includes('style=')) {
      return match.replace(/style="([^"]*)"/, 'style="$1"');
    }
    return match;
  });

  // Remove first heading if keepTitle is false
  if (!options.keepTitle) {
    html = html.replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>/, '');
  }

  // Wrap in container
  html = `<section class="container" style="${s.container}">${html}</section>`;

  return { html, title, readingTime: readingTimeResult };
}
