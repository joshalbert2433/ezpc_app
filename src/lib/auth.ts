import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { encrypt, decrypt } from './jwt';

// These functions are for Node.js runtime (API routes)
export async function login(user: any, req?: NextRequest) {
  const { createSession } = await import('./session');
  
  const userAgent = req?.headers.get('user-agent') || 'Unknown Device';
  const ip = req?.headers.get('x-forwarded-for') || 'Unknown IP';
  
  const sessionId = await createSession(String(user._id || user.id), userAgent, ip);

  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const session = await encrypt({ 
    id: String(user._id || user.id),
    sessionId,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    expires 
  });

  (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
  const session = (await cookies()).get('session')?.value;
  if (session) {
    try {
      const parsed = await decrypt(session);
      const { deleteSession } = await import('./session');
      await deleteSession(parsed.sessionId);
    } catch (err) {
      console.error('Logout cleanup failed:', err);
    }
  }
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
