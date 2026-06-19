import './Mission.css';

const Mission = () => {
  return (
    <section className="mission container">
      <div className="mission-content">
        <div className="mission-info">
          <h2 className="mission-title">WHY LOCAL FRUIT?</h2>

          <p className="mission-intro">
            Fresh fruit picked at peak ripeness has more flavor, vitamins, and
            nutrients than produce shipped cross-country and sitting on store
            shelves for days. When we source directly from local farmers stands,
            everyone wins — the grower, your family, and the planet.
          </p>
        </div>

        <div className="mission-cards">
          <div className="mission-card">
            <div className="mission-card-icon heart-icon">🌱</div>
            <div className="mission-card-content">
              <h3 className="mission-card-title">Peak Nutrition</h3>
              <p className="mission-card-text">
                Fruit picked ripe retains far more vitamins, antioxidants, and
                natural flavor than produce harvested early for long hauls.
              </p>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-card-icon shield-icon">🤝</div>
            <div className="mission-card-content">
              <h3 className="mission-card-title">Support Local</h3>
              <p className="mission-card-text">
                Every order goes directly to Northern California growers —
                real people who tend their land with care.
              </p>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-card-icon brain-icon">🍑</div>
            <div className="mission-card-content">
              <h3 className="mission-card-title">Seasonal Variety</h3>
              <p className="mission-card-text">
                Eating with the seasons means the best of what&apos;s available
                — stone fruit in summer, citrus in winter, berries in spring.
              </p>
            </div>
          </div>
        </div>

        <p className="mission-conclusion">
          Real fruit, real farmers, real flavor — the way it&apos;s supposed to taste.
        </p>
      </div>
    </section>
  );
};

export default Mission;
