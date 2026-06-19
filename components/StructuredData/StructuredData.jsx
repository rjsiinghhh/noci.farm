const StructuredData = ({ type, data }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Noci Farm',
          url: 'https://noci.farm',
          logo: 'https://noci.farm/images/noci-full-logo.png',
          description:
            'Premium handcrafted walnut products made with love in Northern California. Specializing in candied walnuts and honey walnut butter.',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US',
            addressRegion: 'California',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+19167995611',
            contactType: 'customer service',
            email: 'rj@noci.farm',
          },
          sameAs: [
            'https://www.instagram.com/nocifarm',
            'https://www.facebook.com/nocifarm',
          ],
        };

      case 'product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.images || [data.image],
          brand: {
            '@type': 'Brand',
            name: 'Noci Farm',
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: 'Noci Farm',
            },
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: data.rating || '4.9',
            reviewCount: '50',
          },
          category: 'Food & Beverage > Nuts & Seeds',
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Noci Farm',
          url: 'https://noci.farm',
          description:
            'Premium handcrafted walnut products made with love in Northern California',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://noci.farm/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
