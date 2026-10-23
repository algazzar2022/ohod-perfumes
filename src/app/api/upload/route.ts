import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم إرسال أي صورة' },
        { status: 400 }
      );
    }

    // Cloudinary credentials check
    const hasConfig = process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) ||
      true; // Fallback configured in cloudinary.ts

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
