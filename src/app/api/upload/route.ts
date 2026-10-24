import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif'
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم إرسال أي صورة' },
        { status: 400 }
      );
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'حجم الصورة كبير جداً، الحد الأقصى المسموح به هو ٥ ميجابايت' },
        { status: 400 }
      );
    }

    // 2. Validate MIME Type to prevent Stored XSS / Malicious Uploads
    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم، يرجى رفع صور بصيغة JPG أو PNG أو WebP فقط' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload with auto-optimization (compression + webp format conversion)
    const result = await uploadImageToCloudinary(buffer, 'ohod-perfumes/products');

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
