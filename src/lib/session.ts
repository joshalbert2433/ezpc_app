import Session from '@/models/Session';
import dbConnect from './mongodb';

export async function createSession(userId: string, userAgent: string, ip: string) {
  await dbConnect();
  const dbSession = await Session.create({
    user: userId,
    userAgent,
    ip,
    lastActive: new Date()
  });
  return String(dbSession._id);
}

export async function deleteSession(sessionId: string) {
  if (!sessionId) return;
  try {
    await dbConnect();
    await Session.findByIdAndDelete(sessionId);
  } catch (err) {
    console.error('Logout session cleanup failed:', err);
  }
}

export async function updateSessionActivity(sessionId: string) {
  if (!sessionId) return;
  try {
    await dbConnect();
    await Session.findByIdAndUpdate(sessionId, { lastActive: new Date() });
  } catch (err) {
    // Silent fail for activity update
  }
}
