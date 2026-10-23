import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDbAsync, Order } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
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
    const body = await req.json();
    const db = await getDbAsync();

    if (!body.customerName || !body.phone || !body.governorateId || !body.address) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف والمحافظة والعنوان مطلوبين' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'السلة فارغة' }, { status: 400 });
    }

    const gov = db.governorates.find(g => g.id === Number(body.governorateId));
    const shippingFee = gov ? gov.shippingFee : 90;

    let subtotal = 0;
    const items = body.items.map((it: { productId: number; quantity?: number; nameAr?: string; price?: number; image?: string }) => {
      const prod = db.products.find(p => p.id === Number(it.productId));
      const qty = Math.max(1, Number(it.quantity) || 1);
      const effectivePrice = prod
        ? (prod.priceAfterDiscount && prod.priceAfterDiscount > 0 ? prod.priceAfterDiscount : prod.price)
        : (Number(it.price) || 0);

      subtotal += effectivePrice * qty;
      return {
        productId: Number(it.productId),
        nameAr: prod ? prod.nameAr : (it.nameAr || 'منتج'),
        price: effectivePrice,
        quantity: qty,
        image: prod && prod.images && prod.images[0] ? prod.images[0] : (it.image || '/images/logo/don-logo-160.png')
      };
    });

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

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
