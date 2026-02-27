import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: Request) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  await dbConnect();

  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching all orders for admin:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}
