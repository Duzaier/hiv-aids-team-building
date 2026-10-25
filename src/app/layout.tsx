'use client';

import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap'
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full bg-slate-950 text-slate-100 dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <title>Đăng Ký Team Building 2026 — Chung Tay Đẩy Lùi HIV/AIDS</title>
        <meta
          name="description"
          content="Nền tảng đăng ký thi đấu Team Building 6 đội nhân tháng hành động quốc gia phòng, chống HIV/AIDS. Gắn kết yêu thương, xóa nhòa định kiến."
        />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HIV Admin" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body className={`${beVietnamPro.className} min-h-full flex flex-col bg-slate-950 antialiased selection:bg-red-500 selection:text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
