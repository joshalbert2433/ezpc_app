import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product'; // Import Product model

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || !session.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { items, shippingAddress, paymentMethod, paymentResult, totalAmount } = await req.json();

    if (!items || !shippingAddress || !paymentMethod || !totalAmount) {
      return NextResponse.json({ message: 'Missing required order details' }, { status: 400 });
    }

    const userId = session.id;

    // 1. Validate Stock for all items first
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ message: `Product ${item.name} not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        }, { status: 400 });
      }
    }

    // 2. Create the Order
    const newOrder = new Order({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentResult,
      totalAmount,
      status: 'pending',
    });

    await newOrder.save();

    // 3. Decrement Stock for each item
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // 3. Clear user's cart
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    return NextResponse.json({ message: 'Order placed successfully', orderId: newOrder._id }, { status: 201 });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ message: 'Failed to place order' }, { status: 500 });
  }
}
