import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getSession, encrypt } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}.webp`;
    
    // Structure: public/uploads/avatars/
    const relativePath = path.join('uploads', 'avatars');
    const uploadDir = path.join(process.cwd(), 'public', relativePath);
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Compress and optimize image (smaller size for avatar)
    await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filePath);

    // Return the relative URL
    const imageUrl = `/${relativePath}/${filename}`.replace(/\\/g, '/');

    // Update user in database
    await dbConnect();
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.image = imageUrl;
    await user.save();

    await logActivity({
      userId: session.id,
      action: 'Profile Updated',
      details: 'Updated profile picture',
      req
    });

    // Update session cookie
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const newSession = await encrypt({ 
      ...session,
      image: imageUrl,
      expires 
    });

    (await cookies()).set('session', newSession, { expires, httpOnly: true });

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ message: 'Upload failed', error: error.message }, { status: 500 });
  }
}
