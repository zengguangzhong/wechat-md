import { NextRequest, NextResponse } from 'next/server';
import { convertToWechatHtml } from '@/lib/converter';
import type { ConvertOptions } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { markdown, ...options } = body as { markdown: string } & ConvertOptions;

    if (!markdown) {
      return NextResponse.json({ error: 'markdown is required' }, { status: 400 });
    }

    const html = await convertToWechatHtml(markdown, {
      theme: options.theme || 'default',
      primaryColor: options.primaryColor,
      fontFamily: options.fontFamily,
      fontSize: options.fontSize,
      codeTheme: options.codeTheme,
      macCodeBlock: options.macCodeBlock ?? true,
      showLineNumber: options.showLineNumber ?? false,
      citeLinks: options.citeLinks ?? false,
      showReadingTime: options.showReadingTime ?? false,
      keepTitle: options.keepTitle ?? false,
      legend: options.legend,
    });

    return NextResponse.json({ html });
  } catch (err: any) {
    console.error('Convert error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
