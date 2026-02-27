import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.id) {
    return NextResponse.json({ canReview: false, reason: 'Not logged in' });
  }

  await dbConnect();

  try {
    const { id } = await params;

    // 1. Check if already reviewed
    const existingReview = await Review.findOne({ productId: id, userId: session.id });
    if (existingReview) {
      return NextResponse.json({ canReview: false, reason: 'Already reviewed' });
    }

    // 2. Check if purchased and delivered
    const order = await Order.findOne({
      userId: session.id,
      'items.productId': id,
      status: 'delivered'
    });

    if (order) {
      return NextResponse.json({ canReview: true });
    } else {
      return NextResponse.json({ canReview: false, reason: 'Not purchased or not yet delivered' });
    }
  } catch (error) {
    return NextResponse.json({ canReview: false, message: 'Server error' }, { status: 500 });
  }
}
