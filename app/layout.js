import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import StructuredData from '@/components/StructuredData/StructuredData';

export const metadata = {
  title: {
    default: 'Noci Farm',
    template: '%s | Noci Farm',
  },
  description:
    'Fresh, seasonal fruit delivered from Northern California farmers stands to your door. Shop strawberries, peaches, cherries, blueberries & more — sourced locally, picked at peak ripeness.',
  keywords: [
    'fresh fruit delivery',
    'California farmers market',
    'local fruit delivery',
    'seasonal fruit box',
    'Northern California fruit',
    'strawberries',
    'peaches',
    'cherries',
    'blueberries',
    'nectarines',
    'citrus delivery',
    'farmers stand delivery',
    'fresh produce delivery',
    'local farmers',
    'California fruit',
    'farm fresh fruit',
    'fruit delivery service',
    'farm to door',
    'seasonal produce',
    'fruit box',
    'custom fruit box',
    'healthy fruit',
    'California',
  ],
  authors: [{ name: 'Noci Farm' }],
  creator: 'Noci Farm',
  publisher: 'Noci Farm',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://noci.farm'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://noci.farm',
    siteName: 'Noci',
    title: 'Noci Farm - Fresh Fruit from Local Farmers Stands',
    description:
      'Fresh, seasonal fruit sourced weekly from Northern California farmers stands. Strawberries, peaches, cherries, blueberries & more — delivered to your door.',
    images: [
      {
        url: '/images/seasonal-box.jpg',
        width: 1200,
        height: 630,
        alt: 'Noci Farm - Fresh Seasonal Fruit from Northern California Farmers Stands',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noci Farm - Fresh Fruit from Local Farmers Stands',
    description:
      'Farm-fresh fruit delivered from Northern California farmers stands to your door. Sourced weekly, picked at peak season.',
    images: ['/images/seasonal-box.jpg'],
    creator: '@nocifarm',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <StructuredData type="organization" />
        <StructuredData type="website" />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
