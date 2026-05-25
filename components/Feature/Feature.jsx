import './Feature.css';

const Feature = () => {
  return (
    <section className="feature container">
      <div className="feature-content">
        <div className="feature-image">
          {/* <Image
            src="/images/feature-2.jpeg"
            alt="Noci Farm Land"
            width={720}
            height={644}
            className="feature-image-img"
          /> */}
        </div>
        <div className="feature-info">
          <h1 className="feature-title">
            Farmed and Made in Northern California
          </h1>
          {/* <p className="feature-description">
            Currently only selling in California
          </p> */}
        </div>
      </div>
    </section>
  );
};

export default Feature;
