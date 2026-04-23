import frontMatter from 'front-matter';
import hljs from 'highlight.js/lib/core';
import { marked, type RendererObject, type Tokens } from 'marked';
import readingTime from 'reading-time';

import { macCodeSvg } from './constants';
import type { ConvertOptions, ParseResult } from './types';

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

// Configure marked
marked.setOptions({ breaks: true });

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

function buildFootnoteArray(footnotes: [number, string, string][]): string {
  return footnotes
    .map(([index, title, link]) =>
      link === title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`
    )
    .join('\n');
}

function transform(legend: string, text: string | null, title: string | null): string {
  const options = legend.split('-');
  for (const option of options) {
    if (option === 'alt' && text) {
      return text;
    }
    if (option === 'title' && title) {
      return title;
    }
  }
  return '';
}

function parseFrontMatterAndContent(markdownText: string): ParseResult {
  try {
    const parsed = frontMatter(markdownText);
    const yamlData = parsed.attributes as Record<string, any>;
    const markdownContent = parsed.body;
    const readingTimeResult = readingTime(markdownContent);
    return {
      yamlData,
      markdownContent,
      readingTime: readingTimeResult,
    };
  } catch (error) {
    console.error('Error parsing front-matter:', error);
    return {
      yamlData: {},
      markdownContent: markdownText,
      readingTime: readingTime(markdownText),
    };
  }
}

function formatHighlightedCode(html: string, preserveNewlines = false): string {
  let formatted = html;
  // Move spaces between spans into the span
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
  // Replace tabs with 4 spaces
  formatted = formatted.replace(/\t/g, '    ');

  if (preserveNewlines) {
    formatted = formatted
      .replace(/\r\n/g, '<br/>')
      .replace(/\n/g, '<br/>')
      .replace(/(>[^<]+)|(^[^<]+)/g, (str: string) => str.replace(/\s/g, '&nbsp;'));
  } else {
    formatted = formatted.replace(
      /(>[^<]+)|(^[^<]+)/g,
      (str: string) => str.replace(/\s/g, '&nbsp;')
    );
  }

  return formatted;
}

function highlightAndFormatCode(
  text: string,
  language: string,
  showLineNumber: boolean
): string {
  let highlighted = '';

  if (showLineNumber) {
    const rawLines = text.replace(/\r\n/g, '\n').split('\n');

    const highlightedLines = rawLines.map((lineRaw) => {
      const lineHtml = hljs.highlight(lineRaw, { language }).value;
      const formatted = formatHighlightedCode(lineHtml, false);
      return formatted === '' ? '&nbsp;' : formatted;
    });

    const lineNumbersHtml = highlightedLines
      .map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`)
      .join('');
    const codeInnerHtml = highlightedLines.join('<br/>');
    const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
    const lineNumberColumnStyles =
      'text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);';

    highlighted = `
      <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
        <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
        <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
      </section>
    `;
  } else {
    const rawHighlighted = hljs.highlight(text, { language }).value;
    highlighted = formatHighlightedCode(rawHighlighted, true);
  }

  return highlighted;
}

export function renderMarkdown(
  markdown: string,
  options: ConvertOptions
): { html: string; title: string; readingTime: any } {
  // Parse frontmatter
  const { yamlData, markdownContent, readingTime: readingTimeResult } =
    parseFrontMatterAndContent(markdown);

  const title = yamlData.title || '';

  // Footnotes collection
  const footnotes: [number, string, string][] = [];
  let footnoteIndex = 0;

  // List tracking for ordered/unordered
  const listOrderedStack: boolean[] = [];
  const listCounters: number[] = [];

  function addFootnote(title: string, link: string): number {
    const existing = footnotes.find(([, , existingLink]) => existingLink === link);
    if (existing) {
      return existing[0];
    }
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  }

  function styledContent(styleLabel: string, content: string, tagName?: string): string {
    const tag = tagName ?? styleLabel;
    const className = `${styleLabel.replace(/_/g, '-')}`;
    const headingAttr = /^h\d$/.test(tag) ? ' data-heading="true"' : '';
    return `<${tag} class="${className}"${headingAttr}>${content}</${tag}>`;
  }

  function buildReadingTime(): string {
    if (!options.showReadingTime) {
      return '';
    }
    if (!readingTimeResult.words) {
      return '';
    }
    return `
      <blockquote class="md-blockquote">
        <p class="md-blockquote-p">字数 ${readingTimeResult.words}，阅读大约需 ${Math.ceil(readingTimeResult.minutes)} 分钟</p>
      </blockquote>
    `;
  }

  function buildFootnotes(): string {
    if (!footnotes.length) {
      return '';
    }
    return (
      styledContent('h4', '引用链接') +
      styledContent('footnotes', buildFootnoteArray(footnotes), 'p')
    );
  }

  const renderer: RendererObject = {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens);
      const tag = `h${depth}`;
      return styledContent(tag, text);
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens);
      const isFigureImage = text.includes('<figure') && text.includes('<img');
      const isEmpty = text.trim() === '';
      if (isFigureImage || isEmpty) {
        return text;
      }
      return styledContent('p', text);
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens);
      return styledContent('blockquote', text);
    },

    code({ text, lang = '' }: Tokens.Code): string {
      const langText = lang.split(' ')[0];
      const isLanguageRegistered = hljs.getLanguage(langText);
      const language = isLanguageRegistered ? langText : 'plaintext';

      const highlighted = highlightAndFormatCode(
        text,
        language,
        !!options.showLineNumber
      );

      const macSignStyle = options.macCodeBlock !== false ? 'display: flex;' : 'display: none;';
      const span = `<span class="mac-sign" style="${macSignStyle} padding: 10px 14px 0;">${macCodeSvg}</span>`;
      let pendingAttr = '';
      if (!isLanguageRegistered && langText !== 'plaintext') {
        const escapedText = text.replace(/"/g, '&quot;');
        pendingAttr = ` data-language-pending="${langText}" data-raw-code="${escapedText}" data-show-line-number="${options.showLineNumber}"`;
      }
      const code = `<code class="language-${lang}"${pendingAttr}>${highlighted}</code>`;

      return `<pre class="hljs code__pre">${span}${code}</pre>`;
    },

    codespan({ text }: Tokens.Codespan): string {
      const escapedText = escapeHtml(text);
      return styledContent('codespan', escapedText, 'code');
    },

    list({ ordered, items, start = 1 }: Tokens.List) {
      listOrderedStack.push(ordered);
      listCounters.push(Number(start));
      const html = items.map((item) => this.listitem(item)).join('');
      listOrderedStack.pop();
      listCounters.pop();
      return styledContent(ordered ? 'ol' : 'ul', html);
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
      return styledContent('listitem', `${prefix}${content}`, 'li');
    },

    image({ href, title, text }: Tokens.Image): string {
      const newText = options.legend ? transform(options.legend, text, title) : '';
      const subText = newText ? styledContent('figcaption', newText) : '';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<figure><img src="${href}"${titleAttr} alt="${text}"/>${subText}</figure>`;
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens);
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
      }
      if (href === text) {
        return parsedText;
      }
      if (options.citeLinks) {
        const ref = addFootnote(title || text, href);
        return `<a href="${href}" title="${title || text}">${parsedText}<sup>[${ref}]</sup></a>`;
      }
      return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent('strong', this.parser.parseInline(tokens));
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent('em', this.parser.parseInline(tokens));
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header
        .map((cell) => {
          const text = this.parser.parseInline(cell.tokens);
          return styledContent('th', text);
        })
        .join('');
      const body = rows
        .map((row) => {
          const rowContent = row.map((cell) => this.tablecell(cell)).join('');
          return styledContent('tr', rowContent);
        })
        .join('');
      return `
        <section style="max-width: 100%; overflow: auto">
          <table class="preview-table">
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens);
      return styledContent('td', text);
    },

    hr(_: Tokens.Hr): string {
      return styledContent('hr', '');
    },
  };

  marked.use({ renderer });

  // Parse markdown to HTML
  let html = marked.parse(markdownContent) as string;

  // Post-process: add reading time at top
  html = buildReadingTime() + html;

  // Post-process: add footnotes at bottom
  html += buildFootnotes();

  // Post-process: add mac code block style
  html += `
    <style>
      .hljs.code__pre > .mac-sign {
        display: ${options.macCodeBlock !== false ? 'flex' : 'none'};
      }
    </style>
  `;

  // Post-process: ensure h2 strong inherits color
  html += `
    <style>
      h2 strong {
        color: inherit !important;
      }
    </style>
  `;

  // Post-process: remove first heading if keepTitle is false
  if (!options.keepTitle) {
    html = html.replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>/, '');
  }

  // Wrap in section container
  html = styledContent('container', html, 'section');

  return { html, title, readingTime: readingTimeResult };
}
