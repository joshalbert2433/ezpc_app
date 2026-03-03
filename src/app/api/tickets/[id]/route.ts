import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Order from '@/models/Order';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const { id } = await params;

  if (!session || !session.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const ticket = await Ticket.findById(id).populate('orderId');

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Authorization: User can only see their own tickets, Admin can see all
    if (session.role !== 'admin' && ticket.userId.toString() !== session.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ message: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const { id } = await params;

  if (!session || !session.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { action, text, status: newStatus, internalNote, image } = await req.json();
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Authorization
    if (session.role !== 'admin' && ticket.userId.toString() !== session.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (action === 'take') {
      if (session.role !== 'admin') {
        return NextResponse.json({ message: 'Only support agents can take tickets' }, { status: 403 });
      }
      ticket.assignedTo = session.id;
      ticket.assignedName = session.name;
      ticket.status = 'in-progress';
    } else if (action === 'send') {
      if (!text && !image) {
        return NextResponse.json({ message: 'Message text or image is required' }, { status: 400 });
      }
      ticket.messages.push({
        senderId: session.id,
        senderName: session.name,
        senderRole: session.role,
        text,
        image,
        createdAt: new Date(),
      });
      // Update status if it's currently open and an agent replies
      if (ticket.status === 'open' && session.role === 'admin') {
        ticket.status = 'in-progress';
      }
    } else if (action === 'status') {
      if (!newStatus) {
        return NextResponse.json({ message: 'New status is required' }, { status: 400 });
      }
      ticket.status = newStatus;
    } else if (action === 'internalNote') {
      if (session.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      ticket.internalNotes = internalNote;
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await ticket.save();

    // Emit socket event if global.io is available (set in server.mjs)
    if ((global as any).io) {
      (global as any).io.to(id).emit('refresh-ticket');
      if (action === 'send') {
        const lastMessage = ticket.messages[ticket.messages.length - 1];
        (global as any).io.to(id).emit('message-received', lastMessage);
      }
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ message: 'Failed to update ticket' }, { status: 500 });
  }
}
