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

export async function generateMetadata(): Promise<Metadata> {
  return getStoreMetadata();
}

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
