'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { Governorate, StoreSettings } from '@/lib/db';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
  Smartphone
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loadingGovs, setLoadingGovs] = useState(true);

  // Settings for payment gateways
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'عطور أحد | Ohod Perfumes',
    storeTagline: '',
    phone: '01015192223',
    whatsapp: '01015192223',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    bannerEnabled: true,
    bannerText: '',
    instapayAccount: '01015192223',
    instapayInstructions: 'يرجى تحويل إجمالي المبلغ عبر تطبيق انستاباي إلى رقم الهاتف أعلاه ثم إدخال رقم هاتفك المحول منه لتأكيد الطلب.',
    vodafoneCashNumber: '01015192223',
    vodafoneCashInstructions: 'يرجى تحويل إجمالي المبلغ لمحفظة فودافون كاش على الرقم أعلاه ثم إدخال رقم المحفظة المحول منها.',
    footerAboutText: '',
    footerAddress: '',
    footerGuarantees: [],
    footerCopyrightText: '',
    footerDeveloperName: '',
    footerDeveloperUrl: ''
  });

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorateId, setGovernorateId] = useState<number | ''>('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone_cash'>('instapay');
  const [paymentSenderInfo, setPaymentSenderInfo] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [govsRes, setRes] = await Promise.all([
          fetch('/api/governorates'),
          fetch('/api/settings')
        ]);
        const govsData = await govsRes.json();
        const setData = await setRes.json();

        if (govsData.success && govsData.governorates) {
          setGovernorates(govsData.governorates);
          if (govsData.governorates.length > 0) {
            const cairo = govsData.governorates.find((g: Governorate) => g.id === 9 || g.nameAr.includes('القاهره'));
            setGovernorateId(cairo ? cairo.id : govsData.governorates[0].id);
          }
        }

        if (setData.success && setData.settings) {
          setSettings(prev => ({ ...prev, ...setData.settings }));
        }
      } catch (err) {
        console.error('Error fetching checkout data:', err);
      } finally {
        setLoadingGovs(false);
      }
    }
    loadData();
  }, []);

  const selectedGov = governorates.find(g => g.id === Number(governorateId));
  const shippingFee = selectedGov ? selectedGov.shippingFee : 90;
  const grandTotal = subtotal + shippingFee;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('سلة التسوق فارغة، يرجى إضافة منتجات أولاً');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('يرجى إدخال الاسم بالكامل');
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقم (مثال: 01012345678)');
      return;
    }

    if (!governorateId) {
      setErrorMsg('يرجى اختيار المحافظة');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMsg('يرجى إدخال العنوان بالتفصيل (اسم الشارع، رقم المبنى أو علامة مميزة)');
      return;
    }

    const cleanPaymentSender = paymentSenderInfo.trim().replace(/\s+/g, '');
    if (!cleanPaymentSender) {
      setErrorMsg(
        paymentMethod === 'instapay'
          ? 'يرجى إدخال رقم الهاتف المحول منه في انستاباي'
          : 'يرجى إدخال رقم محفظة فودافون كاش المحول منها'
      );
      return;
    }

    if (!phoneRegex.test(cleanPaymentSender)) {
      setErrorMsg(
        paymentMethod === 'instapay'
          ? 'يرجى إدخال رقم هاتف مصري صحيح محول منه عبر انستاباي (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)'
          : 'يرجى إدخال رقم محفظة فودافون كاش مصري صحيح محول منها (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)'
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone: cleanPhone,
          governorateId: Number(governorateId),
          address,
          notes,
          paymentMethod,
          paymentSenderInfo,
          items: items.map(it => ({
            productId: it.productId,
            nameAr: it.nameAr,
            selectedSize: it.selectedSize,
            price: it.price,
            quantity: it.quantity,
            image: it.image
          }))
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        clearCart();
        router.push(`/success?orderId=${data.order.id}`);
      } else {
        setErrorMsg(data.error || 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">سلة التسوق فارغة</h2>
            <p className="text-stone-500 text-sm">
              أضف بعض العطور المميزة إلى سلتك قبل التوجه لصفحة إتمام الطلب.
            </p>
            <Link
              href="/"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3 rounded-full text-sm shadow-md transition"
            >
              تصفح المنتجات الآن
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mb-2">إتمام الطلب</h1>
        <p className="text-stone-500 text-sm mb-8">
          أدخل بيانات الشحن والتوصيل واختر طريقة الدفع المناسبة لك لتأكيد طلبك وتوصيله سريعاً.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                <span>١. بيانات الشحن والتوصيل</span>
              </h2>

              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسمك بالكامل"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm focus:border-amber-600 focus:bg-white outline-none transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
                  رقم الهاتف (واتساب متاح عليه) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-right focus:border-amber-600 focus:bg-white outline-none transition font-medium"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  سيتواصل معك مندوب الشحن على هذا الرقم لتأكيد موعد التسليم
                </span>
              </div>

              {/* Governorate */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
                  المحافظة <span className="text-red-500">*</span>
                </label>
                {loadingGovs ? (
                  <div className="text-xs text-stone-400 py-2">جاري تحميل المحافظات...</div>
                ) : (
                  <select
                    value={governorateId}
                    onChange={(e) => setGovernorateId(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm focus:border-amber-600 focus:bg-white outline-none transition font-medium text-stone-800"
                  >
                    {governorates.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {gov.nameAr} - (شحن {gov.shippingFee === 0 ? 'مجاني' : `${gov.shippingFee} ج.م`})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
                  العنوان بالتفصيل <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="المدينة / المنطقة، اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة بجوارك"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm focus:border-amber-600 focus:bg-white outline-none transition"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
                  ملاحظات إضافية (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="أي تعليمات خاصة بالتسليم أو مواعيد التواجد"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm focus:border-amber-600 focus:bg-white outline-none transition"
                />
              </div>

              {/* PAYMENT SECTION */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>٢. طريقة الدفع الإلكتروني (انستاباي / فودافون كاش)</span>
                </h2>
                <p className="text-xs text-stone-500">
                  اختر وسيلة الدفع المناسبة، وانسخ رقم الحساب لإتمام التحويل، ثم أدخل رقمك المحول منه لتأكيد طلبك:
                </p>

                {/* Gateway Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* InstaPay Card */}
                  <div
                    onClick={() => setPaymentMethod('instapay')}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition relative flex flex-col justify-between ${
                      paymentMethod === 'instapay'
                        ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                        <span className="font-bold text-sm text-stone-900">انستاباي (InstaPay)</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        فوري ⚡
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">تحويل فوري بدون أي مصاريف إضافية</p>
                  </div>

                  {/* Vodafone Cash Card */}
                  <div
                    onClick={() => setPaymentMethod('vodafone_cash')}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition relative flex flex-col justify-between ${
                      paymentMethod === 'vodafone_cash'
                        ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-600"></span>
                        <span className="font-bold text-sm text-stone-900">فودافون كاش (Vodafone Cash)</span>
                      </div>
                      <Smartphone className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-[11px] text-stone-500">تحويل لمحفظة فودافون كاش بسهولة</p>
                  </div>
                </div>

                {/* Active Payment Details & Copy Box */}
                {paymentMethod === 'instapay' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-amber-200">
                      <div>
                        <span className="text-[11px] text-stone-500 block font-medium">
                          رقم الهاتف المسجل في تطبيق انستاباي (InstaPay) للتحويل عليه:
                        </span>
                        <span className="font-black text-stone-900 text-sm sm:text-base font-mono tracking-wide" dir="ltr">
                          {settings.instapayAccount || '01015192223'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.instapayAccount || '01015192223', 'instapay')}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition duration-200 shadow-xs cursor-pointer ${
                          copiedKey === 'instapay'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        {copiedKey === 'instapay' ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>تم النسخ بنجاح! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>نسخ الرقم</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      💡 {settings.instapayInstructions}
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        رقم هاتفك المحول منه عبر انستاباي <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={11}
                        placeholder="010XXXXXXXX"
                        value={paymentSenderInfo}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                          setPaymentSenderInfo(val);
                        }}
                        className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-right focus:border-amber-600 outline-none transition font-mono tracking-wider"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'vodafone_cash' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-red-200">
                      <div>
                        <span className="text-[11px] text-stone-500 block font-medium">
                          رقم محفظة فودافون كاش لتحويل إجمالي المبلغ:
                        </span>
                        <span className="font-black text-stone-900 text-sm sm:text-base font-mono tracking-wide" dir="ltr">
                          {settings.vodafoneCashNumber || '01015192223'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.vodafoneCashNumber || '01015192223', 'vodafone')}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition duration-200 shadow-xs cursor-pointer ${
                          copiedKey === 'vodafone'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {copiedKey === 'vodafone' ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>تم النسخ بنجاح! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>نسخ الرقم</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-red-950 leading-relaxed font-medium">
                      💡 {settings.vodafoneCashInstructions}
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        رقم محفظة فودافون كاش المحول منها <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={11}
                        placeholder="010XXXXXXXX"
                        value={paymentSenderInfo}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                          setPaymentSenderInfo(val);
                        }}
                        className="w-full bg-white border border-red-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-right focus:border-red-600 outline-none transition font-mono tracking-wider"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 text-base transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري تأكيد وتسجيل الطلب...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد الطلب الآن ({grandTotal} ج.م)</span>
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 sticky top-28">
              <h2 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <span>ملخص الطلب ({items.length} منتجات)</span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id || `${it.productId}-${it.selectedSize || 'default'}`} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                      <Image
                        src={it.image}
                        alt={it.nameAr}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-800 text-xs sm:text-sm truncate">
                        {it.nameAr}
                      </h4>
                      {it.selectedSize && (
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                          الحجم: {it.selectedSize}
                        </span>
                      )}
                      <span className="text-xs text-stone-400 block mt-0.5">
                        الكمية: {it.quantity} × {it.price} ج.م
                      </span>
                    </div>
                    <div className="text-sm font-bold text-amber-800">
                      {it.price * it.quantity} ج.م
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-stone-100 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-stone-800">{subtotal} ج.م</span>
                </div>

                <div className="flex justify-between text-stone-600 items-center">
                  <div>
                    <span>مصاريف الشحن</span>
                    <span className="text-xs text-stone-400 block">
                      ({selectedGov ? selectedGov.nameAr : 'المحافظة'})
                    </span>
                  </div>
                  <span className="font-bold text-stone-800">
                    {shippingFee === 0 ? 'مجاناً' : `${shippingFee} ج.م`}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-stone-900">الإجمالي النهائي</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-800">{grandTotal}</span>
                    <span className="text-xs font-bold text-stone-500 mr-1">جنيه مصري</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>ضمان أصالة العطور وثبات يدوم طويلاً</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>توصيل سريع لكافة محافظات مصر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
