import Image from 'next/image';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero container">
      <div className="hero-content">
        <div className="hero-info">
          <h1 className="hero-title">
            Fresh. <br /> Local. <br /> & Ripe.
            <br />
          </h1>
          <p className="hero-description">
            Farm-fresh fruit delivered from Northern California farmers stands
            straight to your door. Sourced weekly, picked at peak season.
          </p>
          <h2 className="hero-subtitle">
            Currently only delivering in California
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
