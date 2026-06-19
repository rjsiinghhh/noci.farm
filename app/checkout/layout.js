export const metadata = {
  title: 'Checkout - Complete Your Order',
  description:
    'Complete your Noci order securely. Order our premium candied walnuts and honey walnut butter with fast, secure checkout.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Checkout - Noci',
    description: 'Complete your order for premium handcrafted walnut products.',
    type: 'website',
  },
};

export default function CheckoutLayout({ children }) {
  return children;
}
