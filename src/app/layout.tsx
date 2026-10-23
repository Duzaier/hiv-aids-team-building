import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'ÄÄƒng KÃ½ Team Building 2026 â€” Chung Tay Äáº©y LÃ¹i HIV/AIDS',
  description:
    'Ná»n táº£ng Ä‘Äƒng kÃ½ thi Ä‘áº¥u Team Building 6 Ä‘á»™i nhÃ¢n thÃ¡ng hÃ nh Ä‘á»™ng quá»‘c gia phÃ²ng, chá»‘ng HIV/AIDS. Gáº¯n káº¿t yÃªu thÆ°Æ¡ng, xÃ³a nhÃ²a Ä‘á»‹nh kiáº¿n.',
  keywords: ['Team Building', 'HIV/AIDS Awareness', 'Há»™i thao cá»™ng Ä‘á»“ng', 'ÄÄƒng kÃ½ 6 Ä‘á»™i', 'Lan tá»a yÃªu thÆ°Æ¡ng'],
  authors: [{ name: 'Ban Tá»• Chá»©c Team Building 2026' }],
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full bg-slate-950 text-slate-100 dark">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}
