'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Order, StoreSettings } from '@/lib/db';
import { CheckCircle, MessageCircle, Home, Loader2, Copy, Check, CreditCard } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const [ordRes, setRes] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch('/api/settings')
        ]);
        const ordData = await ordRes.json();
        const setData = await setRes.json();

        if (ordData.success && ordData.order) {
          setOrder(ordData.order);
        }
        if (setData.success && setData.settings) {
          setSettings(setData.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [orderId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappPhone = settings?.whatsapp || settings?.phone || '01015192223';
  const cleanWaNumber = whatsappPhone.replace(/[^0-9]/g, '').replace(/^0/, '20');

  const isInstapay = order?.paymentMethod === 'instapay';
  const paymentTarget = isInstapay
    ? (settings?.instapayAccount || '01015192223')
    : (settings?.vodafoneCashNumber || '01015192223');

  const whatsappMessage = order
    ? encodeURIComponent(`مرحباً عطور أحد (Ohod Perfumes)، قمت بعمل طلب برقم ${order.orderNumber} باسم ${order.customerName} بقيمة ${order.total} ج.م عبر ${isInstapay ? 'انستاباي' : 'فودافون كاش'} (المحول منه: ${order.paymentSenderInfo || 'غير محدد'}). أرجو تأكيد الطلب.`)
    : '';

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm text-center">
      {/* Animated Success Badge */}
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-in zoom-in-50 duration-300">
        <CheckCircle className="w-12 h-12" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mb-2">
        تم استلام طلبك بنجاح! 🎉
      </h1>
      <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
        شكراً لثقتك في عطور أحد (Ohod Perfumes). تم تسجيل طلبك وسيتواصل معك فريق خدمة العملاء فوراً لتأكيد التحويل وبدء الشحن.
      </p>

      {loading ? (
        <div className="py-8 flex justify-center items-center gap-2 text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جاري تحميل تفاصيل الطلب...</span>
        </div>
      ) : order ? (
        <div className="text-right bg-stone-50 rounded-2xl p-6 border border-stone-200 mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-4 gap-2">
            <div>
              <span className="text-xs text-stone-400 block">رقم الطلب</span>
              <span className="text-lg font-black text-amber-800">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-xs text-stone-400 block">حالة الطلب</span>
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                قيد المراجعة والتجهيز
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-stone-400 block mb-0.5">اسم العميل:</span>
              <span className="font-bold text-stone-800">{order.customerName}</span>
            </div>
            <div>
              <span className="text-stone-400 block mb-0.5">رقم الهاتف:</span>
              <span className="font-bold text-stone-800" dir="ltr">{order.phone}</span>
            </div>
            <div>
              <span className="text-stone-400 block mb-0.5">المحافظة:</span>
              <span className="font-bold text-stone-800">{order.governorateName}</span>
            </div>
            <div>
              <span className="text-stone-400 block mb-0.5">طريقة الدفع المختارة:</span>
              <span className="font-bold text-amber-800">
                {isInstapay ? '💳 انستاباي (InstaPay)' : '📱 فودافون كاش (Vodafone Cash)'}
              </span>
            </div>
            {order.paymentSenderInfo && (
              <div className="sm:col-span-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <span className="text-amber-900 text-xs font-bold block mb-0.5">بيانات التحويل المسجلة:</span>
                <span className="font-mono text-stone-800 font-bold" dir="ltr">{order.paymentSenderInfo}</span>
              </div>
            )}
            <div className="sm:col-span-2">
              <span className="text-stone-400 block mb-0.5">العنوان بالتفصيل:</span>
              <span className="font-medium text-stone-700">{order.address}</span>
            </div>
          </div>

          {/* Payment Account Reminder Box */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="text-xs text-stone-500 block">
                  {isInstapay ? 'رقم هاتف انستاباي المحول إليه:' : 'رقم محفظة فودافون كاش المحول إليها:'}
                </span>
                <span className="font-black text-stone-900 font-mono text-sm" dir="ltr">
                  {paymentTarget}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(paymentTarget)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>

          {/* Items summary */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-bold text-stone-800 text-xs mb-2">العطور المطلوبة:</h4>
            <div className="space-y-1.5">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs text-stone-600">
                  <span>• {it.nameAr} × {it.quantity}</span>
                  <span className="font-bold text-stone-800">{it.price * it.quantity} ج.م</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-sm font-bold">
            <span className="text-stone-700">المجموع شامل الشحن:</span>
            <span className="text-amber-800 text-lg font-black">{order.total} ج.م</span>
          </div>
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {order && (
          <a
            href={`https://wa.me/${cleanWaNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>إرسال إيصال التحويل عبر واتساب</span>
          </a>
        )}

        <Link
          href="/"
          className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition"
        >
          <Home className="w-5 h-5" />
          <span>متابعة التسوق في المتجر</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <Suspense fallback={
          <div className="py-20 flex justify-center items-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        }>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
