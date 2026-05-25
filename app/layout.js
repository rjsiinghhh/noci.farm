import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import StructuredData from '@/components/StructuredData/StructuredData';

export const metadata = {
  title: {
    default:
      'Noci Farm',
    template: '%s | Noci Farm',
  },
  description:
    "Discover Noci Farm's premium handcrafted walnut products. Shop our delicious candied walnuts and creamy honey walnut butter, made with love in Northern California. Rich in omega-3s, antioxidants, and natural goodness.",
  keywords: [
    'candied walnuts',
    'honey walnut butter',
    'fresh walnuts',
    'handcrafted nuts',
    'Northern California Walnuts',
    'healthy snacks',
    'omega-3 walnuts',
    'antioxidant rich nuts',
    'family farm',
    'nuts',
    'walnut products',
    'heart healthy snacks',
    'brain food',
    "health nuts",
    'natural sweet treats',
    'chandler walnuts',
    'made in a home kitchen',
    'trail mix',
    'fresh almonds',
    'honey roasted walnuts',
    'raw almonds',
    'raw walnuts',
    'spicy nuts',
    'heart healthy',
    'California',
    'honey roasted',
    '',
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
    title: 'Noci Farm - Premium Handcrafted Walnut Products',
    description:
      'Did someone say almonds & walnuts?? Made with love in a home kitchen in Northern California & straight from a family farm. Both support heart, brain and gut health while being a great snack. ',
    images: [
      {
        url: '/images/candied-walnuts.png',
        width: 1200,
        height: 630,
        alt: 'Noci Farm Premium Candied Walnuts - Handcrafted in Northern California',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noci Farm - Premium Handcrafted Walnut Products',
    description:
      'Discover our delicious candied walnuts and creamy honey walnut butter, made with love in Northern California.',
    images: ['/images/candied-walnuts.png'],
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
