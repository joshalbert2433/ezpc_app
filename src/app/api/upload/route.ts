import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Get current date for folder structure
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}.webp`;
    
    // Structure: public/uploads/products/YYYY/MM/
    const relativePath = path.join('uploads', 'products', year, month);
    const uploadDir = path.join(process.cwd(), 'public', relativePath);
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists (recursive will create year and month folders)
    await fs.mkdir(uploadDir, { recursive: true });

    // Compress and optimize image
    await sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);

    // Return the relative URL with forward slashes for the web
    const url = `/${relativePath}/${filename}`.replace(/\\/g, '/');
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload error details:', error);
    return NextResponse.json({ message: 'Upload failed', error: error.message }, { status: 500 });
  }
}
