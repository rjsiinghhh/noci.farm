'use client';

import { useState } from 'react';
import Feature from '@/components/Feature/Feature';
import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import Customers from '@/components/Customers';
import Mission from '@/components/Mission/Mission';
import Banner from '@/components/Banner/Banner';
import ComingSoon from '@/components/ComingSoon/ComingSoon';
import Footer from '@/components/Footer/Footer';
import CartSidebar from '@/components/CartSidebar/CartSidebar';
import About from '@/components/About/About'

import ProductGrid from '@/components/ProductGrid/ProductGrid';
import { productItems } from '@/data/products';

export default function Home() {

  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* <Feature /> */}
        {/* <Customers /> */}

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
