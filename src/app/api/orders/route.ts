import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDbAsync, Order } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req, 'orders');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const db = await getDbAsync();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let orders = db.orders;
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`order:${ip}`, 10, 10 * 60 * 1000); // Max 10 orders per 10 minutes per IP
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم إرسال عدد كبير من الطلبات في وقت قصير، يرجى الانتظار قليلاً.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const db = await getDbAsync();

    if (!body.customerName || !body.phone || !body.governorateId || !body.address) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف والمحافظة والعنوان مطلوبين' },
        { status: 400 }
      );
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    const cleanCustomerPhone = String(body.phone).trim().replace(/\s+/g, '');
    if (!phoneRegex.test(cleanCustomerPhone)) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً يبدأ بـ (010, 011, 012, 015)' },
        { status: 400 }
      );
    }

    if (body.paymentMethod === 'instapay' || body.paymentMethod === 'vodafone_cash') {
      const cleanPaymentPhone = String(body.paymentSenderInfo || '').trim().replace(/\s+/g, '');
      if (!phoneRegex.test(cleanPaymentPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: 'يرجى إدخال رقم هاتف مصري صحيح محول منه مكون من 11 رقماً يبدأ بـ (010, 011, 012, 015)'
          },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'السلة فارغة' }, { status: 400 });
    }

    // 1. Validate Stock before placing order
    for (const it of body.items) {
      const prod = db.products.find(p => p.id === Number(it.productId));
      const requestedQty = Math.max(1, Number(it.quantity) || 1);

      if (!prod) continue;

      const availableQty = prod.stockQuantity !== undefined ? prod.stockQuantity : (prod.inStock ? 50 : 0);

      if (!prod.inStock || availableQty <= 0) {
        return NextResponse.json({
          success: false,
          error: `عذراً، المنتج "${prod.nameAr}" نفذت كميته من المخزن حالياً.`
        }, { status: 400 });
      }

      if (requestedQty > availableQty) {
        return NextResponse.json({
          success: false,
          error: `عذراً، الكمية المتوفرة من "${prod.nameAr}" في المخزن هي ${availableQty} قطعة فقط.`
        }, { status: 400 });
      }
    }

    const gov = db.governorates.find(g => g.id === Number(body.governorateId));
    const shippingFee = gov ? gov.shippingFee : 90;

    let subtotal = 0;
    const items = body.items.map((it: { productId: number; quantity?: number; nameAr?: string; price?: number; image?: string; selectedSize?: string }) => {
      const prod = db.products.find(p => p.id === Number(it.productId));
      const qty = Math.max(1, Number(it.quantity) || 1);

      let effectivePrice = Number(it.price) || 0;
      if (prod) {
        if (prod.sizes && Array.isArray(prod.sizes) && prod.sizes.length > 0 && it.selectedSize) {
          const sizeOpt = prod.sizes.find(s => s.size === it.selectedSize);
          if (sizeOpt) {
            effectivePrice = sizeOpt.priceAfterDiscount && sizeOpt.priceAfterDiscount > 0
              ? sizeOpt.priceAfterDiscount
              : sizeOpt.price;
          } else {
            effectivePrice = prod.priceAfterDiscount && prod.priceAfterDiscount > 0 ? prod.priceAfterDiscount : prod.price;
          }
        } else {
          effectivePrice = prod.priceAfterDiscount && prod.priceAfterDiscount > 0 ? prod.priceAfterDiscount : prod.price;
        }
      }

      subtotal += effectivePrice * qty;
      const sizeLabel = it.selectedSize && !it.nameAr?.includes(it.selectedSize) ? ` (${it.selectedSize})` : '';
      return {
        productId: Number(it.productId),
        nameAr: prod ? `${prod.nameAr}${sizeLabel}` : (it.nameAr || 'منتج'),
        selectedSize: it.selectedSize,
        price: effectivePrice,
        quantity: qty,
        image: prod && prod.images && prod.images[0] ? prod.images[0] : (it.image || '/images/logo/don-logo-160.png')
      };
    });

    // 2. Deduct inventory count for each ordered product
    for (const it of items) {
      const prod = db.products.find(p => p.id === it.productId);
      if (prod) {
        const prevQty = prod.stockQuantity !== undefined ? prod.stockQuantity : (prod.inStock ? 50 : 0);
        const nextQty = Math.max(0, prevQty - it.quantity);
        prod.stockQuantity = nextQty;
        if (nextQty === 0) {
          prod.inStock = false;
        }
        prod.updatedAt = new Date().toISOString();
      }
    }

    const total = subtotal + shippingFee;
    const orderNum = 'OHOD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNum,
      customerName: body.customerName.trim(),
      phone: body.phone.trim(),
      governorateId: Number(body.governorateId),
      governorateName: gov ? gov.nameAr : 'غير محدد',
      address: body.address.trim(),
      notes: body.notes?.trim() || '',
      items,
      subtotal,
      shippingFee,
      total,
      status: 'pending',
      paymentMethod: body.paymentMethod === 'vodafone_cash' ? 'vodafone_cash' : 'instapay',
      paymentSenderInfo: body.paymentSenderInfo?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    await saveDbAsync(db);

    try {
      revalidatePath('/', 'page');
      revalidatePath('/', 'layout');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
