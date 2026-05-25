/**
 * Email template generator for order confirmations
 * Generates HTML email content compatible with all email clients
 */

const fs = require('fs');
const path = require('path');
const STANDARD_SIZE = 'Standard';

/**
 * Generate order confirmation email HTML
 * @param {Object} order - Order object with customer and item details
 * @returns {string} - HTML email content
 */
function generateOrderConfirmationEmail(order) {
  const templatePath = path.join(
    __dirname,
    '../email-templates/order-confirmation.html',
  );
  let template = fs.readFileSync(templatePath, 'utf8');

  // Format order date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate items HTML
  const itemsHtml = order.items
    .map(item => {
      // Check if this is a pack product
      const isPack = item.type === 'variety-pack' || item.type === 'gift-pack';
      let packDetailsHtml = '';

      if (item.type === 'variety-pack' && item.contents) {
        packDetailsHtml = `
          <p
            style="
              margin: 5px 0 0 0;
              font-size: 11px;
              color: #f59e0b;
              font-style: italic;
            "
          >
            🎁 Contains: Raw Walnuts, Candied Walnuts, Honey Roasted Walnuts, Roasted Walnuts
          </p>`;
      } else if (item.type === 'gift-pack' && item.selectionDetails) {
        packDetailsHtml = `
          <p
            style="
              margin: 5px 0 0 0;
              font-size: 11px;
              color: #f59e0b;
              font-style: italic;
            "
          >
            🎁 Your selection: ${item.selectionDetails}
          </p>`;
      }

      return `
    <div
      style="
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
        background-color: ${isPack ? '#fef3c7' : '#ffffff'};
        display: flex;
        align-items: center;
        gap: 15px;
      "
      class="item-card"
    >
      <div style="flex: 1;" class="item-details">
        <h4
          style="
            margin: 0 0 5px 0;
            font-size: 16px;
            font-weight: bold;
            color: #000000;
          "
        >
          ${item.name}${isPack ? ' 🎁' : ''}
        </h4>
        <p
          style="
            margin: 0 0 5px 0;
            font-size: 12px;
            color: #666666;
          "
        >
          Size: ${item.size || STANDARD_SIZE}
        </p>
        ${packDetailsHtml}
        <p
          style="
            margin: 0;
            font-size: 14px;
            color: #000000;
          "
        >
          Quantity: ${item.quantity}
        </p>
      </div>
      <div
        style="
          text-align: right;
          font-size: 16px;
          font-weight: bold;
          color: #000000;
          min-width: 80px;
        "
        class="item-price"
      >
        ${item.isFreeItem ? '$0.00' : `$${(item.price * item.quantity).toFixed(2)}`}
      </div>
    </div>
  `;
    })
    .join('');

  // Replace template variables
  template = template.replace(
    /\{\{orderNumber\}\}/g,
    order.orderNumber || order.id,
  );
  template = template.replace(/\{\{orderDate\}\}/g, orderDate);
  template = template.replace(
    /\{\{status\}\}/g,
    order.status.charAt(0).toUpperCase() + order.status.slice(1),
  );
  template = template.replace(
    /\{\{trackingNumber\}\}/g,
    order.trackingNumber || 'TBD',
  );
  template = template.replace(
    /\{\{totalAmount\}\}/g,
    order.totalAmount.toFixed(2),
  );
  template = template.replace(/\{\{customerName\}\}/g, order.customerInfo.name);
  template = template.replace(
    /\{\{customerAddress\}\}/g,
    order.customerInfo.address,
  );
  template = template.replace(/\{\{customerCity\}\}/g, order.customerInfo.city);
  template = template.replace(
    /\{\{customerState\}\}/g,
    order.customerInfo.state,
  );
  template = template.replace(
    /\{\{customerZipCode\}\}/g,
    order.customerInfo.zipCode,
  );
  template = template.replace(
    /\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g,
    itemsHtml,
  );

  return template;
}

/**
 * Generate a simple text version of the order confirmation
 * @param {Object} order - Order object with customer and item details
 * @returns {string} - Plain text email content
 */
function generateOrderConfirmationText(order) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let text = `
ORDER CONFIRMED

Thank you for your order! We've received your payment and will begin processing your order shortly.

ORDER DETAILS
=============
Order Number: ${order.orderNumber || order.id}
Order Date: ${orderDate}
Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
Tracking Number: ${order.trackingNumber || 'TBD'}

ITEMS ORDERED
=============
`;

  order.items.forEach(item => {
    text += `${item.name} (${item.size || STANDARD_SIZE}) - Qty: ${
      item.quantity
    } - ${item.isFreeItem ? '$0.00' : `$${(item.price * item.quantity).toFixed(2)}`}\n`;

    // Add pack details for variety pack and gift pack
    if (item.type === 'variety-pack' && item.contents) {
      text += `  Contains: ${item.contents
        .map(id => {
          // Map product IDs to names (basic mapping)
          const productNames = {
            1: 'Raw Walnuts',
            2: 'Candied Walnuts',
            3: 'Honey Roasted Walnuts',
            4: 'Roasted Walnuts',
          };
          return productNames[id] || `Product ${id}`;
        })
        .join(', ')}\n`;
    } else if (item.type === 'gift-pack' && item.selectionDetails) {
      text += `  Your selection: ${item.selectionDetails}\n`;
    }
  });

  text += `\nTotal: $${order.totalAmount.toFixed(2)}\n\n`;

  text += `
SHIPPING ADDRESS
===============
${order.customerInfo.name}
${order.customerInfo.address}
${order.customerInfo.city}, ${order.customerInfo.state} ${order.customerInfo.zipCode}

CONTACT INFORMATION
==================
If you have any questions about your order, please contact us:

Email: rj@noci.farm
Phone: 916 799 5611

Thank you for choosing Noci!
`;

  return text;
}

module.exports = {
  generateOrderConfirmationEmail,
  generateOrderConfirmationText,
};
