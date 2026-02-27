import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const { id } = await params;
    const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const { rating, comment } = await req.json();

    if (!rating || !comment) {
      return NextResponse.json({ message: 'Rating and comment are required' }, { status: 400 });
    }

    // 1. Verify if the user has purchased this product
    const order = await Order.findOne({
      userId: session.id,
      'items.productId': id,
      status: 'delivered' // Ensuring it's a completed purchase
    });

    if (!order) {
      return NextResponse.json({ 
        message: 'You can only review products you have purchased and received.' 
      }, { status: 403 });
    }

    // 2. Check if the user already reviewed this product
    const existingReview = await Review.findOne({
      productId: id,
      userId: session.id
    });

    if (existingReview) {
      return NextResponse.json({ message: 'You have already reviewed this product.' }, { status: 400 });
    }

    // 3. Create the review
    const newReview = new Review({
      productId: id,
      userId: session.id,
      userName: session.name || 'Anonymous',
      rating,
      comment
    });

    await newReview.save();

    // 4. Update Product aggregation (optional but good for performance)
    const allReviews = await Review.find({ productId: id });
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(id, {
      rating: Number(avgRating.toFixed(1)),
      reviews: allReviews.length
    });

    return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });

  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ message: 'Error submitting review' }, { status: 500 });
  }
}
