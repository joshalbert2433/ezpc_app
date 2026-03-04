import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const query: any = { deletedAt: null };
    
    // Filtering logic
    const category = searchParams.get('category');
    if (category) query.category = { $in: category.split(',') };
    
    const brand = searchParams.get('brand');
    if (brand) query.brand = { $in: brand.split(',') };
    
    // Price filter will be handled in aggregation pipeline for accuracy
    const maxPriceParam = searchParams.get('maxPrice');
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : null;
    const minPriceParam = searchParams.get('minPrice');
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : null;
    
    // Badge filters (sale, featured, hot, etc.)
    const badges = searchParams.get('badges');
    if (badges) query.badge = { $in: badges.split(',') };

    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { specs: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = searchParams.get('sort');
    let sortStage: any = { $sort: { createdAt: -1 } };
    if (sort === 'low') sortStage = { $sort: { effectivePrice: 1 } };
    else if (sort === 'high') sortStage = { $sort: { effectivePrice: -1 } };

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Use aggregation to handle effective price filtering and sorting
    const basePipeline = [
      { $match: query },
      {
        $addFields: {
          effectivePrice: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$badge", "sale"] },
                  { $gt: ["$salePrice", 0] }
                ]
              },
              then: "$salePrice",
              else: "$price"
            }
          }
        }
      },
      ...(maxPrice !== null ? [{ $match: { effectivePrice: { $lte: maxPrice } } }] : []),
      ...(minPrice !== null ? [{ $match: { effectivePrice: { $gte: minPrice } } }] : [])
    ];

    // Get total count after filtering
    const countResult = await Product.aggregate([
      ...basePipeline,
      { $count: "total" }
    ]);
    const total = countResult.length > 0 ? countResult[0].total : 0;
    
    const products = await Product.aggregate([
      ...basePipeline,
      sortStage,
      { $skip: skip },
      { $limit: limit }
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const product = await Product.create({
      name: body.name,
      category: body.category,
      brand: body.brand,
      price: body.price,
      salePrice: body.salePrice || 0,
      stock: body.stock || 0,
      badge: body.badge || '',
      specs: body.specs,
      images: body.images || [],
      description: body.description,
      fullSpecs: body.fullSpecs || []
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
