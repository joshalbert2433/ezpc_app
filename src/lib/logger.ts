import Activity from '@/models/Activity';
import dbConnect from './mongodb';

export async function logActivity({ userId, action, details, req }: { 
  userId: string, 
  action: string, 
  details?: string, 
  req?: any 
}) {
  try {
    await dbConnect();
    
    // Get client info if request object provided
    let ip = '';
    let userAgent = '';
    if (req) {
      ip = req.headers.get('x-forwarded-for') || '';
      userAgent = req.headers.get('user-agent') || '';
    }

    await Activity.create({
      user: userId,
      action,
      details,
      ip,
      userAgent
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
