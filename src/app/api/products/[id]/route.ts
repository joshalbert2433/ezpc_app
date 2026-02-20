import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';

async function checkAdmin() {
  const session = await getSession();
  return session && session.role === 'admin';
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const product = await Product.findOne({ _id: id, deletedAt: null });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    
    // Explicitly handle the fields to ensure they are updated
    const updateData = {
      name: body.name,
      category: body.category,
      brand: body.brand,
      price: body.price,
      specs: body.specs,
      images: body.images,
      description: body.description,
      fullSpecs: body.fullSpecs
    };

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id } = await params;
    await dbConnect();
    // Soft delete by setting deletedAt
    const product = await Product.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ message: 'Product soft-deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
