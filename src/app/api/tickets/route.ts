import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function GET(req: Request) {
  const session = await getSession();

  if (!session || !session.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query: any = {};
    if (session.role === 'admin') {
      if (status) {
        query.status = status;
      }
    } else {
      query.userId = session.id;
    }

    const tickets = await Ticket.find(query).sort({ updatedAt: -1 });

    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ message: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || !session.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { subject, message, category, orderId } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ message: 'Subject and message are required' }, { status: 400 });
    }

    const newTicket = await Ticket.create({
      userId: session.id,
      userName: session.name,
      subject,
      category: category || 'general',
      orderId: orderId || undefined,
      status: 'open',
      messages: [
        {
          senderId: session.id,
          senderName: session.name,
          senderRole: session.role,
          text: message,
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ message: 'Failed to create ticket' }, { status: 500 });
  }
}
