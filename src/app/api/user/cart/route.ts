import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
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
    
    // Filter out items where product no longer exists in database
    const initialCount = user.cart.length;
    const validCart = user.cart.filter((item: any) => item.product !== null);
    
    // If any items were removed because the product was deleted, update the user record
    if (validCart.length !== initialCount) {
      user.cart = user.cart.filter((item: any) => item.product !== null);
      await user.save();
    }
    
    return NextResponse.json(validCart);
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

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    // Ensure cart exists
    if (!user.cart) {
      user.cart = [];
    }
    
    // Improved matching logic: Ensure both are strings for comparison
    const itemIndex = user.cart.findIndex((item: any) => 
      String(item.product) === String(productId)
    );
    
    if (itemIndex > -1) {
      const newQuantity = user.cart[itemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return NextResponse.json({ 
          message: `Cannot add more. Only ${product.stock} units in stock.` 
        }, { status: 400 });
      }

      user.cart[itemIndex].quantity = Math.max(1, newQuantity);
    } else {
      if (quantity > product.stock) {
        return NextResponse.json({ 
          message: `Cannot add ${quantity}. Only ${product.stock} units in stock.` 
        }, { status: 400 });
      }
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
    console.log('Attempting to remove product from cart:', productId);
    
    await dbConnect();
    
    const user = await User.findById(session.id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // Use pull to remove the item from the subdocument array
    // This is more reliable than filter and re-assign for Mongoose
    const initialLength = user.cart.length;
    user.cart.pull({ product: productId });
    
    if (user.cart.length === initialLength) {
      console.log('Item not found in cart or already removed');
    }

    await user.save();
    console.log('Cart updated successfully, new length:', user.cart.length);
    
    return NextResponse.json({ message: 'Item removed', cart: user.cart });
  } catch (error: any) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
