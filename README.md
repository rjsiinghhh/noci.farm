# Noci - Premium Walnut Products E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js for selling premium walnut products. Noci (Italian for "walnuts") offers a seamless shopping experience with integrated payment processing, order management, and customer feedback systems.

## 🚀 Features

### Customer Features

- **Product Catalog**: Browse premium walnut products including candied walnuts, honey roasted walnuts, raw walnuts, roasted walnuts, and honey walnut butter
- **Shopping Cart**: Add products to cart with real-time updates
- **Secure Checkout**: Integrated Stripe payment processing with secure payment forms
- **Order Tracking**: Track order status with real-time updates
- **Order Confirmation**: Automated email confirmations with order details
- **Customer Feedback**: Submit feedback after order delivery
- **Responsive Design**: Mobile-first design optimized for all devices

### Admin Features

- **Admin Dashboard**: Secure admin panel with authentication
- **Order Management**: View, manage, and update order statuses
- **Review Management**: Moderate and manage customer reviews
- **Analytics**: View sales statistics and order metrics
- **Auto-Delivery System**: Automated order delivery processing via cron jobs

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.5.9](https://nextjs.org/) with App Router
- **React**: 19.1.0
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Payments**: [Stripe](https://stripe.com/)
- **Email Service**: [Resend](https://resend.com/)
- **UI Components**: Custom React components with CSS modules
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Carousel**: [Swiper](https://swiperjs.com/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 24.8.0 or higher
- **npm** or **yarn** or **pnpm**
- **Supabase Account**: For database and backend services
- **Stripe Account**: For payment processing
- **Resend Account**: For email delivery

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd noci
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

   # Resend Email Service
   RESEND_API_KEY=your_resend_api_key

   # Admin Configuration
   ADMIN_SECRET_KEY=your_secure_admin_secret_key

   # Cron Job Configuration (optional, for auto-delivery)
   CRON_SECRET=your_cron_secret_key

   # Shipping Configuration (optional)
   NEXT_PUBLIC_SHIPPING_COST=6.00
   NEXT_PUBLIC_SHIPPING_FREE_THRESHOLD=50.00
   ```

4. **Set up Supabase Database**

   You'll need to create the following tables in your Supabase database:

   - `orders`: Store order information
   - `order_items`: Store individual items in each order
   - `reviews`: Store customer reviews/feedback
   - `customers`: Store customer information (if applicable)

   Refer to your database schema or migration files for the exact table structure.

5. **Configure Stripe Products**

   Update the product and price IDs in `lib/stripe.js` to match your Stripe dashboard:

   ```javascript
   export const STRIPE_PRODUCTS = {
     CANDIED_WALNUTS: 'your_product_id',
     // ... other products
   };
   ```

6. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
noci/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard pages
│   │   ├── orders/         # Order management
│   │   ├── reviews/        # Review management
│   │   └── login/          # Admin authentication
│   ├── api/                 # API routes
│   │   ├── admin/          # Admin API endpoints
│   │   ├── checkout/       # Checkout processing
│   │   ├── orders/         # Order management
│   │   ├── webhook/        # Stripe webhooks
│   │   └── cron/           # Cron job endpoints
│   ├── checkout/            # Checkout page
│   ├── feedback/            # Customer feedback pages
│   └── track-order/         # Order tracking page
├── components/              # React components
│   ├── CartSidebar/        # Shopping cart sidebar
│   ├── Checkout/           # Checkout form components
│   ├── Header/             # Site header
│   ├── Footer/             # Site footer
│   └── ProductGrid/        # Product display grid
├── contexts/               # React contexts
│   └── CartContext.js      # Shopping cart state management
├── lib/                    # Utility libraries
│   ├── supabase.js         # Supabase client configuration
│   ├── stripe.js           # Stripe client configuration
│   ├── stripe-server.js    # Stripe server-side configuration
│   ├── email-service.js    # Email service integration
│   └── auto-deliver.js     # Auto-delivery logic
├── data/                   # Static data
│   └── products.js         # Product catalog
└── public/                 # Static assets
    ├── images/             # Product images
    └── fonts/              # Custom fonts
```

## 🔑 Key Features Explained

### Shopping Cart

The cart is managed through React Context (`CartContext.js`) and persists across page navigation. Products can be added, removed, and quantities updated.

### Checkout Process

1. Customer information collection
2. Shipping address validation
3. Payment processing via Stripe
4. Order creation in Supabase
5. Email confirmation sent via Resend

### Order Management

- Orders are stored in Supabase
- Admin can view and update order statuses
- Customers can track orders using order numbers
- Automatic delivery processing via cron jobs

### Email System

- Order confirmation emails sent automatically
- Feedback request emails sent after delivery
- Custom HTML email templates

### Admin Panel

- Secure authentication using secret key
- Dashboard with order statistics
- Order detail views with customer information
- Review moderation system

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Configure build command as `npm run build`
- **AWS Amplify**: Follow Next.js deployment guide
- **Docker**: Create a Dockerfile for containerized deployment

### Environment Variables in Production

Make sure to set all environment variables in your deployment platform's environment settings.

### Cron Jobs

If using the auto-delivery feature, set up a cron job to call:

```
GET /api/cron/auto-deliver
```

Include the `Authorization: Bearer <CRON_SECRET>` header for security.

## 🧪 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Code Style

This project uses ESLint with Next.js configuration. Follow the existing code style and patterns.

## 🔒 Security Considerations

- Admin routes are protected with secret key authentication
- Stripe webhooks are verified for authenticity
- Environment variables are never committed to version control
- Supabase Row Level Security (RLS) should be configured for production
- Cron endpoints should be secured with authentication

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainer.

## 📞 Support

For support, please contact the development team or open an issue in the repository.

---

Built with ❤️ using Next.js and modern web technologies.
