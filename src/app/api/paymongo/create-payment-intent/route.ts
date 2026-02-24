import { NextResponse } from 'next/server';
import PaymongoClient from 'paymongo-node';
import { getSession } from '@/lib/auth'; // Import getSession

export async function POST(req: Request) {
  const session = await getSession(); // Get session

  if (!session || !session.id) { // Check if user is logged in
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, returnUrl, description } = await req.json();

    const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

    if (!PAYMONGO_SECRET_KEY) {
      return NextResponse.json({ message: 'PayMongo secret key not configured' }, { status: 500 });
    }

    const paymongo = new PaymongoClient(PAYMONGO_SECRET_KEY);

    const paymentIntent = await paymongo.paymentIntent.create({
      amount: amount,
      payment_method_allowed: ['card', 'paymaya', 'gcash'],
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      currency: 'PHP',
      description: description,
      statement_descriptor: 'EZPC Order',
      return_url: returnUrl,
    });
    
    const nextActionUrl = paymentIntent.attributes.next_action?.redirect_to_url?.url;

    if (!nextActionUrl) {
      return NextResponse.json({ message: 'No redirect URL found for payment intent' }, { status: 500 });
    }

    return NextResponse.json({ clientSecret: paymentIntent.attributes.client_key, nextActionUrl });

  } catch (error: any) {
    console.error('Error creating PayMongo payment intent:', error);
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message || 'Internal server error';
    return NextResponse.json({ message: 'Failed to create payment intent', error: errorMessage }, { status: 500 });
  }
}
