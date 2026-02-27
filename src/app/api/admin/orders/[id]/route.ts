import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ message: 'Missing order status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid order status' }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
  }
}
