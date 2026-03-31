import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const activities = await Activity.find({ user: session.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
