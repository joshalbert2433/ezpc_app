import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const sessions = await Session.find({ user: session.id })
      .sort({ lastActive: -1 });

    // Mark current session
    const sessionsWithCurrent = sessions.map(s => ({
      ...s.toObject(),
      isCurrent: String(s._id) === session.sessionId
    }));

    return NextResponse.json(sessionsWithCurrent);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
