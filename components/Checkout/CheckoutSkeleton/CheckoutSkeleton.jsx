import './CheckoutSkeleton.css';

const CheckoutSkeleton = () => {
  return (
    <div className="checkout-content">
      <div className="checkout-left">
        <div className="checkout-form-skeleton">
          <div className="checkout-steps-skeleton">
            <div className="checkout-step-skeleton"></div>
            <div className="checkout-step-skeleton"></div>
          </div>
          <div className="form-section-skeleton">
            <div className="form-fields-skeleton">
              <div className="form-field-skeleton"></div>
              <div className="form-field-skeleton"></div>
              <div className="form-field-skeleton"></div>
              <div className="form-field-skeleton"></div>
              <div className="form-field-skeleton"></div>
              <div className="form-field-skeleton"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-right">
        <div className="order-summary-skeleton">
          <div className="order-summary-header-skeleton"></div>
          <div className="order-items-skeleton">
            <div className="order-item-skeleton">
              <div className="item-image-skeleton"></div>
              <div className="item-details-skeleton">
                <div className="item-line-skeleton"></div>
                <div className="item-line-skeleton"></div>
                <div className="item-line-skeleton"></div>
              </div>
            </div>
          </div>
          <div className="order-totals-skeleton">
            <div className="total-line-skeleton"></div>
            <div className="total-line-skeleton"></div>
            <div className="total-line-skeleton total-skeleton"></div>
          </div>
          <div className="delivery-info-skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSkeleton;
