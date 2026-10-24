import { NextRequest, NextResponse } from 'next/server';
import { getDbAsync, saveDbAsync, Product } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = await getDbAsync();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category');
    const search = searchParams.get('q')?.toLowerCase();

    let list = db.products;
    if (categoryId) {
      const catNum = Number(categoryId);
      list = list.filter(p => p.categoryId === catNum);
    }
    if (search) {
      list = list.filter(p =>
        (p.nameAr && p.nameAr.toLowerCase().includes(search)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(search)) ||
        (p.descriptionAr && p.descriptionAr.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ success: true, products: list });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDbAsync();

    if (!body.nameAr || body.price === undefined) {
      return NextResponse.json({ success: false, error: 'الاسم والسعر مطلوبان' }, { status: 400 });
    }

    const nextId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;

    let images = body.images;
    if (!Array.isArray(images) || images.length === 0) {
      images = body.image ? [body.image] : ['/images/logo/don-logo-160.png'];
    }

    const newProduct: Product = {
      id: nextId,
      nameAr: body.nameAr.trim(),
      nameEn: body.nameEn?.trim() || null,
      descriptionAr: body.descriptionAr?.trim() || null,
      descriptionEn: body.descriptionEn?.trim() || null,
      price: Number(body.price),
      priceAfterDiscount: Number(body.priceAfterDiscount || 0),
      categoryId: Number(body.categoryId || (db.categories[0]?.id || 1)),
      available: body.available !== undefined ? Boolean(body.available) : true,
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : 50,
      images,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    await saveDbAsync(db);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
