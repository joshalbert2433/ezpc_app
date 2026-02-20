import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getSession } from '@/lib/auth';

async function checkAdmin() {
  const session = await getSession();
  return session && session.role === 'admin';
}

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.find({});
    // Convert array to a simple object { key: value }
    const config = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    // Default values if not in DB
    const defaults = {
      maxProductImages: 6,
    };

    return NextResponse.json({ ...defaults, ...config });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  try {
    await dbConnect();
    const body = await req.json(); // Expected { key: string, value: any }
    
    const { key, value } = body;
    if (!key) return NextResponse.json({ message: 'Key is required' }, { status: 400 });

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );

    return NextResponse.json(setting);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
