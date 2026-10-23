import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';
import { getStoreMetadata } from '@/lib/seo';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ohodperfumes.com'),
  title: 'عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر',
  description: 'تسوق أفضل العطور والزيوت العطرية المركزة بدون كحول في مصر من عطور أحد (Ohod Perfumes). عطور فرنسية وشرقية رجالي وحريمي، ثبات عالي وتوصيل سريع لكافة المحافظات مع دفع سهل عبر انستاباي وفودافون كاش.',
  keywords: ['عطور أحد', 'Ohod Perfumes', 'عطور فرنسية', 'عطور شرقية', 'دون الأصلي', 'دون الأبيض', 'دون البينك', 'زيوت عطرية', 'عطور بدون كحول', 'عطور مصر', 'شراء عطور أونلاين'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر',
    description: 'تسوق أفضل العطور والزيوت العطرية المركزة بدون كحول في مصر من عطور أحد (Ohod Perfumes). عطور فرنسية وشرقية رجالي وحريمي، ثبات عالي وتوصيل سريع لكافة المحافظات مع دفع سهل عبر انستاباي وفودافون كاش.',
    url: 'https://ohodperfumes.com',
    siteName: 'عطور أحد | Ohod Perfumes',
    locale: 'ar_EG',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/kuypfdzb/image/upload/v1792719223/807590317_1763755772421552_7849880766636249819_n.jpg',
        width: 1000,
        height: 1000,
        alt: 'عطور أحد | Ohod Perfumes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر',
    description: 'تسوق أفضل العطور والزيوت العطرية المركزة بدون كحول في مصر من عطور أحد (Ohod Perfumes). عطور فرنسية وشرقية رجالي وحريمي، ثبات عالي وتوصيل سريع لكافة المحافظات مع دفع سهل عبر انستاباي وفودافون كاش.',
    images: ['https://res.cloudinary.com/kuypfdzb/image/upload/v1792719223/807590317_1763755772421552_7849880766636249819_n.jpg'],
    creator: '@ohodperfumes',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-stone-50 text-stone-900 min-h-screen flex flex-col selection:bg-amber-600 selection:text-white" suppressHydrationWarning>
        <CartProvider>
          {children}
          <CartDrawer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
