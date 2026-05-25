import { NextResponse } from 'next/server';
import { sendStripeOrderConfirmationEmail } from '@/lib/email-service';
import { stripe } from '@/lib/stripe-server';

export async function POST(request) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Fetch payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Extract order data from Stripe metadata
    const metadata = paymentIntent.metadata;

    // Parse items from metadata
    let items = [];
    try {
      items = JSON.parse(metadata.items || '[]');
    } catch (error) {
      console.error('Error parsing items from metadata:', error);
      items = [];
    }

    // Parse shipping address from metadata
    let shippingAddress = null;
    try {
      console.log('Raw shipping address metadata:', metadata.shippingAddress);
      const parsedAddress = JSON.parse(metadata.shippingAddress || '{}');
      // Only use shipping address if it has actual data
      if (
        parsedAddress &&
        Object.keys(parsedAddress).length > 0 &&
        parsedAddress.line1
      ) {
        shippingAddress = parsedAddress;
      } else {
        shippingAddress = null;
      }
      console.log('Parsed shipping address:', shippingAddress);
    } catch (error) {
      console.error('Error parsing shipping address from metadata:', error);
      shippingAddress = null;
    }

    // Construct order data for email
    const orderData = {
      orderNumber: paymentIntent.id,
      orderDate: new Date(paymentIntent.created * 1000).toISOString(),
      customerEmail: metadata.customerEmail || '',
      customerInfo: {
        name: metadata.customerName || 'Customer',
        email: metadata.customerEmail || '',
        address: '', // We don't have address in old metadata
        city: '', // We don't have city in old metadata
        state: '', // We don't have state in old metadata
        zipCode: '', // We don't have zipCode in old metadata
      },
      items: items,
      totalAmount: parseFloat(metadata.total || '0'),
      // For old orders, we don't have shipping address, so use null
      // The email template will fall back to customerInfo
      shippingAddress: shippingAddress,
    };

    // Send email
    console.log('About to send email with order data:', orderData);
    await sendStripeOrderConfirmationEmail(orderData);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending Stripe order email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
