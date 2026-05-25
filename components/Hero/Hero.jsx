import Image from 'next/image';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero container">
      <div className="hero-content">
        <div className="hero-info">
          <h1 className="hero-title">
           Crunchy. <br /> Tasty. <br /> & Healthy.
            <br />
          </h1>
          <p className="hero-description">
            Homemade walnut snacks - the perfect mix of crunch, sweetness & real
            natural ingredients. Farmed in Northern California & made for you.
          </p>
          <h2 className="hero-subtitle">
            Currently only selling in California
          </h2>
        </div>
        {/* <div className="hero-image">
          <Image
            src="/images/hero-image.webp"
            alt="Noci Farm Land"
            width={720}
            height={644}
            className="hero-image-img"
          />
        </div> */}
      </div>
    </section>
  );
};

export default Hero;
