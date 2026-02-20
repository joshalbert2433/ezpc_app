import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const user = await User.findById(session.id);
    return NextResponse.json(user.addresses || []);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const addressData = await req.json();
    await dbConnect();
    
    const user = await User.findById(session.id);
    
    // If this is the first address or set as default, unset other defaults
    if (addressData.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr: any) => addr.isDefault = false);
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();
    
    return NextResponse.json(user.addresses);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { addressId, ...updateData } = await req.json();
    await dbConnect();
    
    const user = await User.findById(session.id);
    const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === addressId);
    
    if (addressIndex === -1) return NextResponse.json({ message: 'Address not found' }, { status: 404 });

    if (updateData.isDefault) {
      user.addresses.forEach((addr: any) => addr.isDefault = false);
    }

    // Update fields
    Object.assign(user.addresses[addressIndex], updateData);
    
    await user.save();
    return NextResponse.json(user.addresses);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { addressId } = await req.json();
    await dbConnect();
    
    const user = await User.findById(session.id);
    user.addresses = user.addresses.filter((addr: any) => addr._id.toString() !== addressId);
    
    // If we deleted the default, set the first remaining one as default
    if (user.addresses.length > 0 && !user.addresses.some((a: any) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return NextResponse.json(user.addresses);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
