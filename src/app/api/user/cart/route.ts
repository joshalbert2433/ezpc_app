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
      path: 'cart.product',
      options: { strictPopulate: false }
    });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json(user.cart || []);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { productId, quantity = 1 } = await req.json();
    await dbConnect();
    
    const user = await User.findById(session.id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // Ensure cart exists
    if (!user.cart) {
      user.cart = [];
    }
    
    // Improved matching logic: Ensure both are strings for comparison
    const itemIndex = user.cart.findIndex((item: any) => 
      String(item.product) === String(productId)
    );
    
    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
      if (user.cart[itemIndex].quantity < 1) {
        user.cart[itemIndex].quantity = 1;
      }
    } else {
      if (quantity > 0) {
        user.cart.push({ product: productId, quantity });
      }
    }

    await user.save();
    return NextResponse.json({ message: 'Cart updated', cart: user.cart });
  } catch (error: any) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { productId } = await req.json();
    await dbConnect();
    
    const user = await User.findById(session.id);
    if (!user || !user.cart) return NextResponse.json({ message: 'Cart not found' }, { status: 404 });

    user.cart = user.cart.filter((item: any) => String(item.product) !== String(productId));
    
    await user.save();
    return NextResponse.json({ message: 'Item removed', cart: user.cart });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
