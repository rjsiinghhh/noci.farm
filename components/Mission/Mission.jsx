import './Mission.css';

const Mission = () => {
  return (
    <section className="mission container">
      <div className="mission-content">
        <div className="mission-info">
          <h2 className="mission-title">WHY WALNUTS?</h2>

          <p className="mission-intro">
            4 grams of protein, 2 grams of fiber, 18 grams of fat & 180
            calories per ounce, Walnuts are more than just a snack — they're a
            powerhouse of nutrition. Rich in plant-based omega-3s, vitamins,
            minerals, and antioxidants, they fuel your body and support
            long-term health.
          </p>
        </div>

        <div className="mission-cards">
          <div className="mission-card">
            <div className="mission-card-icon heart-icon">❤️</div>
            <div className="mission-card-content">
              <h3 className="mission-card-title">Heart Healthy</h3>
              <p className="mission-card-text">
                Help lower bad cholesterol, reduce inflammation, & keep your
                blood vessels strong.
              </p>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-card-icon shield-icon">🛡️</div>
            <div className="mission-card-content">
              <h3 className="mission-card-title">Protective Power</h3>
              <p className="mission-card-text">
                Antioxidants & plant compounds that may reduce the risk of
                certain cancers.
              </p>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-card-icon brain-icon">⚡</div>
            <div className="mission-card-content">
              <h3 className="mission-card-title">Brain & Body Boost</h3>
              <p className="mission-card-text">
                Packed with nutrients that support energy, focus, & overall
                wellness.
              </p>
            </div>
          </div>
        </div>

        <p className="mission-conclusion">
          Delicious, Nutritious, and Versatile — Walnuts Make Healthy Living
          Easy
        </p>
      </div>
    </section>
  );
};

export default Mission;
