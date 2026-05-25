import './OrderConfirmationSkeleton.css';

const OrderConfirmationSkeleton = () => {
  return (
    <>
      <div className="order-confirmation-header">
        <div className="order-confirmation-success-skeleton">
          <div className="order-confirmation-success-icon-skeleton"></div>
          <div className="order-confirmation-success-content-skeleton">
            <div className="order-confirmation-title-skeleton"></div>
            <div className="order-confirmation-subtitle-skeleton"></div>
          </div>
        </div>
      </div>

      <div className="order-confirmation-content">
        <div className="order-confirmation-left">
          <div className="order-confirmation-details-skeleton">
            <div className="order-confirmation-section-title-skeleton"></div>

            <div className="order-confirmation-info-skeleton">
              <div className="order-confirmation-info-row-skeleton">
                <div className="order-confirmation-info-label-skeleton"></div>
                <div className="order-confirmation-info-value-skeleton"></div>
              </div>
              <div className="order-confirmation-info-row-skeleton">
                <div className="order-confirmation-info-label-skeleton"></div>
                <div className="order-confirmation-info-value-skeleton"></div>
              </div>
              <div className="order-confirmation-info-row-skeleton">
                <div className="order-confirmation-info-label-skeleton"></div>
                <div className="order-confirmation-info-value-skeleton"></div>
              </div>
            </div>

            <div className="order-confirmation-shipping-skeleton">
              <div className="order-confirmation-shipping-title-skeleton"></div>
              <div className="order-confirmation-shipping-address-skeleton">
                <div className="shipping-line-skeleton"></div>
                <div className="shipping-line-skeleton"></div>
                <div className="shipping-line-skeleton"></div>
                <div className="shipping-line-skeleton"></div>
              </div>
            </div>

            <div className="order-confirmation-items-skeleton">
              <div className="order-confirmation-items-title-skeleton"></div>
              <div className="order-confirmation-item-skeleton">
                <div className="order-confirmation-item-image-skeleton"></div>
                <div className="order-confirmation-item-info-skeleton">
                  <div className="order-confirmation-item-name-skeleton"></div>
                  <div className="order-confirmation-item-size-skeleton"></div>
                  <div className="order-confirmation-item-price-skeleton"></div>
                </div>
                <div className="order-confirmation-item-total-skeleton"></div>
              </div>
              <div className="order-confirmation-item-skeleton">
                <div className="order-confirmation-item-image-skeleton"></div>
                <div className="order-confirmation-item-info-skeleton">
                  <div className="order-confirmation-item-name-skeleton"></div>
                  <div className="order-confirmation-item-size-skeleton"></div>
                  <div className="order-confirmation-item-price-skeleton"></div>
                </div>
                <div className="order-confirmation-item-total-skeleton"></div>
              </div>
            </div>

            <div className="order-confirmation-total-skeleton">
              <div className="order-confirmation-total-row-skeleton"></div>
              <div className="order-confirmation-total-row-skeleton"></div>
              <div className="order-confirmation-total-row-skeleton order-confirmation-total-final-skeleton"></div>
            </div>
          </div>
        </div>

        <div className="order-confirmation-right">
          <div className="order-confirmation-next-steps-skeleton">
            <div className="order-confirmation-next-steps-title-skeleton"></div>

            <div className="order-confirmation-next-steps-list-skeleton">
              <div className="order-confirmation-next-step-skeleton">
                <div className="order-confirmation-next-step-icon-skeleton"></div>
                <div className="order-confirmation-next-step-content-skeleton">
                  <div className="next-step-title-skeleton"></div>
                  <div className="next-step-text-skeleton"></div>
                </div>
              </div>
              <div className="order-confirmation-next-step-skeleton">
                <div className="order-confirmation-next-step-icon-skeleton"></div>
                <div className="order-confirmation-next-step-content-skeleton">
                  <div className="next-step-title-skeleton"></div>
                  <div className="next-step-text-skeleton"></div>
                </div>
              </div>
              <div className="order-confirmation-next-step-skeleton">
                <div className="order-confirmation-next-step-icon-skeleton"></div>
                <div className="order-confirmation-next-step-content-skeleton">
                  <div className="next-step-title-skeleton"></div>
                  <div className="next-step-text-skeleton"></div>
                </div>
              </div>
            </div>

            <div className="order-confirmation-contact-skeleton">
              <div className="contact-title-skeleton"></div>
              <div className="contact-line-skeleton"></div>
              <div className="contact-line-skeleton"></div>
              <div className="contact-line-skeleton"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-confirmation-actions">
        <div className="order-confirmation-home-btn-skeleton"></div>
      </div>
    </>
  );
};

export default OrderConfirmationSkeleton;

