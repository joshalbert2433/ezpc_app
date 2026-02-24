import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // Import getSession from custom auth
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: Request) {
  const session = await getSession(); // Use custom getSession

  if (!session || !session.id) { // Check if session exists and has a user ID
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const userId = session.id; // Extract userId directly from the session payload

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}
