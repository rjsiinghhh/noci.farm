'use client';

import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { FaStar, FaCheck } from 'react-icons/fa';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import './Customers.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const Customers = () => {
  const swiperRef = useRef(null);

  useEffect(() => {
    const equalizeCardHeights = () => {
      if (swiperRef.current) {
        const cards = swiperRef.current.querySelectorAll('.testimonial-card');

        // Reset heights first
        cards.forEach(card => {
          card.style.height = 'auto';
        });

        // Find the maximum height
        let maxHeight = 0;
        cards.forEach(card => {
          const height = card.offsetHeight;
          if (height > maxHeight) {
            maxHeight = height;
          }
        });

        // Set all cards to the maximum height
        cards.forEach(card => {
          card.style.height = maxHeight + 'px';
        });
      }
    };

    // Initial equalization
    const timer = setTimeout(equalizeCardHeights, 100);

    // Re-equalize on window resize
    window.addEventListener('resize', equalizeCardHeights);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', equalizeCardHeights);
    };
  }, []);

  const originalTestimonials = [
    {
      id: 1,
      name: 'Sarah',
      rating: 5,
      text: 'The candied walnuts from Noci.farm are absolutely incredible! The perfect balance of sweetness and crunch, and you can taste the quality of the Northern California Chandler walnuts. My family goes through a 5-bag in no time.',
      verified: true,
    },
    {
      id: 2,
      name: 'Michael',
      rating: 5,
      text: "I've tried many walnut butters, but Noci.farm's honey walnut butter is in a league of its own. The simple, clean ingredients really shine through. It's become my go-to breakfast spread and the customer service team was so helpful with my order.",
      verified: true,
    },
    {
      id: 3,
      name: 'Jennifer',
      rating: 4.5,
      text: "These candied walnuts are dangerously addictive! The cinnamon and vanilla notes are perfectly balanced. I love that they're made with quality ingredients and the bulk pricing makes it easy to stock up. Highly recommend!",
      verified: true,
    },
    {
      id: 4,
      name: 'David',
      rating: 5,
      text: "As someone who's health-conscious, I appreciate that the honey walnut butter uses only 4 simple ingredients. The taste is rich and satisfying, and it's become a staple in my pantry. The team at Noci.farm clearly cares about quality.",
      verified: true,
    },
    {
      id: 5,
      name: 'Lisa',
      rating: 5,
      text: 'The candied walnuts are perfect for entertaining! Guests always ask where I got them. The packaging is beautiful and the walnuts are consistently fresh. Customer service was excellent when I had questions about bulk orders.',
      verified: true,
    },
    {
      id: 6,
      name: 'Robert',
      rating: 4.5,
      text: "I've been ordering from Noci.farm for months now. The honey walnut butter is creamy and delicious, and the candied walnuts are the perfect snack. The fact that they're grown and made in Northern California adds to the appeal.",
      verified: true,
    },
    {
      id: 7,
      name: 'Amanda',
      rating: 5,
      text: 'These products exceeded my expectations! The candied walnuts have the perfect crunch and the honey walnut butter is so smooth. I love supporting a local California business that focuses on quality ingredients.',
      verified: true,
    },
    {
      id: 8,
      name: 'James',
      rating: 5,
      text: 'The customer service at Noci.farm is outstanding. They helped me choose the right bulk option for my family, and the products arrived fresh and perfectly packaged. The candied walnuts are now a family favorite!',
      verified: true,
    },
    {
      id: 9,
      name: 'Maria',
      rating: 4.5,
      text: "I'm impressed with the quality and taste of both products. The honey walnut butter is perfect on toast and the candied walnuts are great for snacking. The ingredients list is clean and simple, which I really appreciate.",
      verified: true,
    },
    {
      id: 10,
      name: 'Kevin',
      rating: 5,
      text: 'Noci.farm has become my go-to for premium walnut products. The candied walnuts are perfectly sweetened and the honey walnut butter is incredibly smooth. The customer support team was very responsive to my questions.',
      verified: true,
    },
  ];

  // Duplicate testimonials multiple times to create seamless infinite scroll
  const testimonials = [
    ...originalTestimonials,
    ...originalTestimonials.map(t => ({ ...t, id: t.id + 10 })),
    ...originalTestimonials.map(t => ({ ...t, id: t.id + 20 })),
  ];

  return (
    <section className="customers-section " ref={swiperRef}>
      <div className="customers-header container">
        <h2 className="customers-title">WHAT CUSTOMER SAYS</h2>
        <div className="customers-navigation desktop">
          <button className="nav-button nav-prev">
            <IoArrowBack />
          </button>
          <button className="nav-button nav-next">
            <IoArrowForward />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={16}
        slidesPerView={1.25}
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          767: {
            slidesPerView: 1.75,
            spaceBetween: 16,
          },
          991: {
            slidesPerView: 2.5,
            spaceBetween: 16,
          },
          1200: {
            slidesPerView: 3.5,
            spaceBetween: 16,
          },
        }}
        navigation={{
          prevEl: '.nav-prev',
          nextEl: '.nav-next',
        }}
        className="customers-swiper"
      >
        {testimonials.map(testimonial => (
          <SwiperSlide key={testimonial.id}>
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(Math.floor(testimonial.rating))].map((_, index) => (
                  <FaStar key={index} className="star-icon" />
                ))}
                {testimonial.rating % 1 !== 0 && (
                  <FaStar key="half" className="star-icon half-star" />
                )}
              </div>
              <div className="testimonial-header">
                <h3 className="testimonial-name">{testimonial.name}</h3>
                {testimonial.verified && (
                  <div className="verified-badge">
                    <FaCheck />
                  </div>
                )}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="customers-navigation mobile">
        <button className="nav-button nav-prev">
          <IoArrowBack />
        </button>
        <button className="nav-button nav-next">
          <IoArrowForward />
        </button>
      </div>
    </section>
  );
};

export default Customers;
