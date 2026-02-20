import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const query: any = {};
    
    // Filtering logic
    const category = searchParams.get('category');
    if (category) query.category = { $in: category.split(',') };
    
    const brand = searchParams.get('brand');
    if (brand) query.brand = { $in: brand.split(',') };
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) query.price = { $lte: parseFloat(maxPrice) };
    
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { specs: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = searchParams.get('sort');
    let sortOptions = {};
    if (sort === 'low') sortOptions = { price: 1 };
    else if (sort === 'high') sortOptions = { price: -1 };
    else sortOptions = { createdAt: -1 };

    const products = await Product.find(query).sort(sortOptions);
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
