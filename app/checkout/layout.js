export const metadata = {
  title: 'Checkout - Complete Your Order',
  description:
    'Complete your Noci order securely. Order fresh, seasonal fruit from local Northern California farmers stands.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Checkout - Noci',
    description: 'Complete your order for fresh fruit from local farmers stands.',
    type: 'website',
  },
};

export default function CheckoutLayout({ children }) {
  return children;
}
