import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const user = await User.findById(session.id).populate({
      path: 'wishlist',
      options: { strictPopulate: false }
    });
    return NextResponse.json(user.wishlist || []);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { productId } = await req.json();
    await dbConnect();
    
    const user = await User.findById(session.id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // Initialize wishlist if missing
    if (!user.wishlist) {
      user.wishlist = [];
    }
    
    const exists = user.wishlist.some((id: any) => String(id) === String(productId));
    
    if (exists) {
      user.wishlist = user.wishlist.filter((id: any) => String(id) !== String(productId));
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    return NextResponse.json({ 
      message: exists ? 'Removed from wishlist' : 'Added to wishlist', 
      wishlist: user.wishlist 
    });
  } catch (error: any) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
