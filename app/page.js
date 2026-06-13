'use client';

import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import Mission from '@/components/Mission/Mission';
import Banner from '@/components/Banner/Banner';
import ComingSoon from '@/components/ComingSoon/ComingSoon';
import Footer from '@/components/Footer/Footer';
import CartSidebar from '@/components/CartSidebar/CartSidebar';

import ProductGrid from '@/components/ProductGrid/ProductGrid';
import { productItems } from '@/data/products';

export default function Home() {

  return (
    <>
      <Header />
      <main>
        <Hero />

        <ProductGrid items={productItems} />
        <Mission />
        <Banner />
        <ComingSoon />
      </main>
      <Footer />
      <CartSidebar />
    </>
  );
}
