import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "md2wechat - Markdown 转微信公众号",
  description: "在线将 Markdown 转换为微信公众号支持的 HTML 格式，支持多主题、自定义配色、代码高亮",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
