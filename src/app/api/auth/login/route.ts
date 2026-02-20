import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      expires 
    });

    (await cookies()).set('session', session, { expires, httpOnly: true });

    return NextResponse.json({ 
      message: 'Logged in successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
