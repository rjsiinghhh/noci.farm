import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const STANDARD_SIZE = 'Standard';

// Escape user-controlled values before interpolating into HTML emails so special
// characters (O'Brien, "Foo & Bar St") render correctly and can't inject markup.
const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Resend can fail transiently; retry with linear backoff so a brief outage
// doesn't permanently drop a confirmation email.
const sendEmailWithRetry = async (payload, { attempts = 3, baseDelayMs = 500 } = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const { data, error } = await resend.emails.send(payload);
      if (!error) return { data };
      lastError = error;
    } catch (err) {
      lastError = err;
    }
    console.error(
      `Email send attempt ${attempt}/${attempts} failed:`,
      lastError?.message || lastError,
    );
    if (attempt < attempts) {
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * attempt));
    }
  }
  throw new Error(
    `Failed to send email after ${attempts} attempts: ${
      lastError?.message || 'unknown error'
    }`,
  );
};

export const generateOrderConfirmationEmail = orderData => {
  const {
    orderNumber,
    orderDate,
    customerInfo,
    items,
    totalAmount,
    shippingAddress,
  } = orderData;

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = amount => {
    return `$${amount.toFixed(2)}`;
  };

  const generateItemsHTML = items => {
    return items
      .map(
        item => `
      <div
        style="
          padding: 15px;
          border-bottom: 1px solid #e0e0e0;
          background-color: ${item.isFreeItem ? '#f0fdf4' : '#ffffff'};
          display: flex;
          align-items: center;
          gap: 15px;
        "
        class="item-card"
      >
        <div style="flex: 1" class="item-details">
          <h4
            style="
              margin: 0 0 5px 0;
              font-size: 16px;
              font-weight: bold;
              color: #000000;
            "
          >
            ${escapeHtml(item.name)}${item.isFreeItem ? ' <span style="background-color: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 8px;">FREE</span>' : ''}
          </h4>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666666">
            ${item.size ? `Size: ${escapeHtml(item.size)}` : escapeHtml(item.description) || `Size: ${STANDARD_SIZE}`}
          </p>
          ${
            item.selectionDetails
              ? `<p style="margin: 0 0 5px 0; font-size: 12px; color: #666666">${escapeHtml(item.selectionDetails)}</p>`
              : ''
          }
          <p style="margin: 0; font-size: 14px; color: #000000">
            Quantity: ${item.quantity}
          </p>
        </div>
        <div
          style="
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            color: ${item.isFreeItem ? '#10b981' : '#000000'};
            min-width: 80px;
          "
          class="item-price"
        >
          ${item.isFreeItem ? '$0.00' : formatCurrency(item.price * item.quantity)}
        </div>
      </div>
    `,
      )
      .join('');
  };

  // The email previously showed only "Total" (= subtotal + shipping) with no
  // breakdown, so item prices didn't sum to the total. Derive the lines so the
  // math reconciles for the customer.
  const subtotal = items.reduce(
    (sum, item) => sum + (item.isFreeItem ? 0 : item.price * item.quantity),
    0,
  );
  const shipping = Math.max(0, (Number(totalAmount) || 0) - subtotal);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation - Noci</title>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      /* Reset styles for email clients */
      body,
      table,
      td,
      p,
      a,
      li,
      blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
    </style>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #000000;
    "
  >
    <!-- Email Container -->
    <div
      style="
        max-width: 600px;
        width: 96%;
        margin: 16px auto;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
      "
      class="container"
    >
      <!-- Header -->
      <div
        style="
          padding: 20px 20px 0;
          text-align: center;
          background-color: #ffffff;
        "
        class="content"
      >
        <h1
          style="
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            color: #000000;
            text-align: center;
          "
        >
          Order Confirmed
        </h1>
      </div>

      <!-- Thank You Message -->
      <div
        style="
          padding: 0 20px 20px 20px;
          text-align: center;
          background-color: #ffffff;
        "
        class="content"
      >
        <p
          style="margin: 0 0 20px 0; font-size: 16px; color: #000000; text-align: center"
        >
          Thank you for your order! We've received your payment and will begin
          processing your order shortly.
        </p>
        
        <!-- Order Number Highlight -->
        <div
          style="
            background-color: #f8f8f8;
            border: 2px solid #000000;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          "
        >
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">
            Your Order Number
          </p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000000; letter-spacing: 2px;">
            ${orderNumber}
          </p>
        </div>

        <!-- Track Order CTA Button -->
        <div style="margin: 30px 0;">
          <a
            href="https://www.noci.farm/track-order?orderNumber=${orderNumber}&email=${encodeURIComponent(
              customerInfo.email,
            )}"
            style="
              display: inline-block;
              background-color: #000000;
              color: #ffffff;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 4px;
              font-size: 16px;
              font-weight: bold;
              text-align: center;
            "
          >
            Track Your Order
          </a>
        </div>

        <!-- Estimated Delivery -->
        <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666; text-align: center">
          Estimated delivery: 7-10 business days
        </p>
      </div>

      <!-- Order Details Section -->
      <div
        style="
          padding: 0 20px 0 20px;
          background-color: #ffffff;
          margin-bottom: 30px;
        "
        class="content section"
      >
        <h2
          style="
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: bold;
            color: #000000;
          "
        >
          Order Details
        </h2>

        <div
          style="display: flex; flex-wrap: wrap; gap: 12px"
          class="order-info"
        >
          <div style="flex: 1; min-width: 200px" class="order-info-item">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #000000">
              <strong>Order Date:</strong><br />
              ${formatDate(orderDate)}
            </p>
          </div>
          <div style="flex: 1; min-width: 200px" class="order-info-item">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #000000">
              <strong>Status:</strong><br />
              Paid
            </p>
          </div>
        </div>
      </div>

      <!-- Items Ordered Section -->
      <div
        style="
          padding: 0 20px 0 20px;
          background-color: #ffffff;
          margin-bottom: 30px;
        "
        class="content section"
      >
        <h3
          style="
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: bold;
            color: #000000;
          "
        >
          Items Ordered
        </h3>

        <!-- Items Container -->
        <div
          style="
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
          "
        >
          ${generateItemsHTML(items)}

          <!-- Subtotal Row -->
          <div
            style="
              padding: 12px 15px;
              background-color: #ffffff;
              border-top: 1px solid #e0e0e0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span style="font-size: 14px; color: #555555">Subtotal</span>
            <span style="font-size: 14px; color: #555555">
              ${formatCurrency(subtotal)}
            </span>
          </div>

          <!-- Shipping Row -->
          <div
            style="
              padding: 12px 15px;
              background-color: #ffffff;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span style="font-size: 14px; color: #555555">Shipping</span>
            <span style="font-size: 14px; color: #555555">
              ${shipping === 0 ? 'FREE' : formatCurrency(shipping)}
            </span>
          </div>

          <!-- Total Row -->
          <div
            style="
              padding: 15px;
              background-color: #f8f8f8;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span style="font-size: 18px; font-weight: bold; color: #000000">
              Total:
            </span>
            <span style="font-size: 18px; font-weight: bold; color: #000000">
              ${formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <!-- Shipping Details Section -->
      <div
        style="
          padding: 0 20px 0 20px;
          background-color: #ffffff;
          margin-bottom: 30px;
        "
        class="content section"
      >
        <h3
          style="
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: bold;
            color: #000000;
          "
        >
          Shipping Address
        </h3>

        <div
          style="
            padding: 20px;
            background-color: #f8f8f8;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
          "
        >
          <p
            style="margin: 0; font-size: 14px; color: #000000; line-height: 1.5"
          >
            <strong>${escapeHtml(shippingAddress?.name || customerInfo.name)}</strong><br />
            ${escapeHtml(shippingAddress?.line1 || customerInfo.address)}<br />
            ${escapeHtml(shippingAddress?.city || customerInfo.city)}, ${escapeHtml(
              shippingAddress?.state || customerInfo.state,
            )} ${escapeHtml(shippingAddress?.postal_code || customerInfo.zipCode)}
          </p>
        </div>
      </div>

      <!-- Contact Information Section -->
      <div
        style="
          padding: 0 20px 0 20px;
          background-color: #ffffff;
          margin-bottom: 30px;
        "
        class="content section"
      >
        <h3
          style="
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: bold;
            color: #000000;
          "
        >
          Contact Information
        </h3>

        <p style="margin: 0 0 15px 0; font-size: 14px; color: #000000">
          If you have any questions about your order, please contact us:
        </p>

        <div
          style="display: flex; flex-wrap: wrap; gap: 20px"
          class="contact-info"
        >
          <div style="flex: 1; min-width: 200px" class="contact-item">
            <p style="margin: 0; font-size: 14px; color: #000000">
              <strong>Email:</strong><br />
              <a
                href="mailto:rj@noci.farm"
                style="color: #000000; text-decoration: underline"
                >rj@noci.farm</a
              >
            </p>
          </div>
          <div style="flex: 1; min-width: 200px" class="contact-item">
            <p style="margin: 0; font-size: 14px; color: #000000">
              <strong>Phone:</strong><br />
              <a
                href="tel:+19167995611"
                style="color: #000000; text-decoration: underline"
                >916 799 5611</a
              >
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        style="
          padding: 20px 40px;
          background-color: #f8f8f8;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        "
        class="content"
      >
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #666666">
          Thank you for choosing Noci!
        </p>
        <p style="margin: 0; font-size: 12px; color: #666666">
          Visit us again at
          <a
            href="https://www.noci.farm"
            style="color: #000000; text-decoration: underline"
            >noci.farm</a
          >
        </p>
      </div>
    </div>
  </body>
</html>
  `;
};

export const sendOrderConfirmationEmail = async orderData => {
  try {
    const { customerInfo } = orderData;

    // Never call Resend with an empty recipient (would fail with `to: ['']`).
    if (!customerInfo?.email) {
      throw new Error('Customer email is required to send order confirmation');
    }

    const emailHtml = generateOrderConfirmationEmail(orderData);

    const { data } = await sendEmailWithRetry({
      from: 'updates@noci.farm',
      to: [customerInfo.email],
      subject: `Order Confirmation`,
      html: emailHtml,
    });

    console.log('Order confirmation email sent successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    throw error;
  }
};

export const sendStripeOrderConfirmationEmail = async orderData => {
  try {
    if (!orderData.customerEmail) {
      throw new Error('Customer email is required');
    }

    const emailHtml = generateOrderConfirmationEmail(orderData);

    const { data } = await sendEmailWithRetry({
      from: 'updates@noci.farm',
      to: orderData.customerEmail,
      subject: `Order Confirmation`,
      html: emailHtml,
    });

    console.log('Stripe order confirmation email sent successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendStripeOrderConfirmationEmail:', error);
    throw error;
  }
};

export const generateFeedbackRequestEmail = ({
  orderNumber,
  customerName,
  token,
}) => {
  // Use environment variable for base URL, fallback to production URL
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://www.noci.farm');
  const feedbackUrl = `${baseUrl}/feedback/${orderNumber}?token=${encodeURIComponent(
    token,
  )}`;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>We'd Love Your Feedback - Noci</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #000000;
    "
  >
    <div
      style="
        max-width: 600px;
        width: 96%;
        margin: 16px auto;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
      "
    >
      <div style="padding: 20px 20px 0; text-align: center; background-color: #ffffff;">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #000000;">
          Thank You for Your Order!
        </h1>
      </div>

      <div style="padding: 0 20px 30px 20px; text-align: center; background-color: #ffffff;">
        <p style="margin: 0; font-size: 16px; color: #000000; text-align: center">
          Hi ${escapeHtml(customerName)},
        </p>
        <p style="margin: 20px 0; font-size: 16px; color: #000000; text-align: center">
          We hope you're enjoying your order from Noci Farm! Your feedback helps us improve and serve you better.
        </p>
        <p style="margin: 20px 0; font-size: 16px; color: #000000; text-align: center">
          Please take a moment to share your experience with us.
        </p>
      </div>

      <div style="padding: 0 20px 30px 20px; text-align: center; background-color: #ffffff;">
        <a
          href="${feedbackUrl}"
          style="
            display: inline-block;
            background-color: #000000;
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
          "
        >
          Leave Feedback
        </a>
      </div>

      <div style="padding: 0 20px 30px 20px; background-color: #ffffff;">
        <p style="margin: 0; font-size: 14px; color: #666666; text-align: center">
          Order Number: <strong>${escapeHtml(orderNumber)}</strong>
        </p>
      </div>

      <div
        style="
          padding: 20px 40px;
          background-color: #f8f8f8;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        "
      >
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #666666">
          Thank you for choosing Noci!
        </p>
        <p style="margin: 0; font-size: 12px; color: #666666">
          Visit us again at
          <a
            href="https://www.noci.farm"
            style="color: #000000; text-decoration: underline"
            >noci.farm</a
          >
        </p>
      </div>
    </div>
  </body>
</html>
  `;
};

export const sendFeedbackRequestEmail = async ({
  orderNumber,
  customerEmail,
  customerName,
  token,
}) => {
  try {
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    const emailHtml = generateFeedbackRequestEmail({
      orderNumber,
      customerName,
      token,
    });

    const { data } = await sendEmailWithRetry({
      from: 'updates@noci.farm',
      to: customerEmail,
      subject: `We'd Love Your Feedback - Order ${orderNumber}`,
      html: emailHtml,
    });

    console.log('Feedback request email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendFeedbackRequestEmail:', error);
    throw error;
  }
};
