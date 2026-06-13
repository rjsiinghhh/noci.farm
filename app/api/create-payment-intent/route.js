import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { SHIPPING_CONFIG } from '@/lib/stripe';
import {
  CartValidationError,
  calculateCartTotals,
  normalizeIncomingItems,
  validateCustomerInfo,
} from '@/lib/cart-validation';
import {
  ORDER_ACCESS_COOKIE,
  ORDER_ACCESS_COOKIE_OPTIONS,
  buildOrderAccessCookieValue,
} from '@/lib/order-access';

export async function POST(request) {
  try {
    const { items, customerInfo } = await request.json();
    validateCustomerInfo(customerInfo);
    const normalizedItems = normalizeIncomingItems(items);

    const { subtotal, shipping, total } = calculateCartTotals(
      normalizedItems,
      SHIPPING_CONFIG,
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        shippingAddress: JSON.stringify({
          name: customerInfo.name,
          line1: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          postal_code: customerInfo.zipCode,
          country: 'US',
        }),
        items: JSON.stringify(
          normalizedItems.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            type: item.type || 'regular',
            contents: item.contents || undefined,
            customSelection: item.customSelection || undefined,
            selectionDetails: item.selectionDetails || undefined,
            isFreeItem: item.isFreeItem || false,
            linkedToProduct: item.linkedToProduct || undefined,
          })),
        ),
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
      },
    });

    const response = NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
    });

    // Bind this browser to the new PaymentIntent so it (and only it) can later
    // read the order via /api/stripe-order on the confirmation page.
    response.cookies.set(
      ORDER_ACCESS_COOKIE,
      buildOrderAccessCookieValue(request, paymentIntent.id),
      ORDER_ACCESS_COOKIE_OPTIONS,
    );

    return response;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    if (error instanceof CartValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 },
    );
  }
}
