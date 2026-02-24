import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // Import getSession from custom auth
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(req: Request) {
  const session = await getSession(); // Use custom getSession

  if (!session || !session.id) { // Check if session exists and has a user ID
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { items, shippingAddress, paymentMethod, paymentResult, totalAmount } = await req.json();

    if (!items || !shippingAddress || !paymentMethod || !totalAmount) {
      return NextResponse.json({ message: 'Missing required order details' }, { status: 400 });
    }

    const userId = session.id; // Extract userId directly from the session payload

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

    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    return NextResponse.json({ message: 'Order placed successfully', orderId: newOrder._id }, { status: 201 });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ message: 'Failed to place order' }, { status: 500 });
  }
}
