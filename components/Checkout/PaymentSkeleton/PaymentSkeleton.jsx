import './PaymentSkeleton.css';

const PaymentSkeleton = () => {
  return (
    <div className="payment-skeleton">
      <div className="payment-header-skeleton"></div>

      <div className="payment-form-skeleton">
        <div className="payment-field-skeleton"></div>

        <div className="payment-row-skeleton">
          <div className="payment-field-skeleton"></div>
          <div className="payment-field-skeleton"></div>
        </div>

        <div className="payment-field-skeleton"></div>
      </div>

      <div className="payment-security-skeleton"></div>
    </div>
  );
};

export default PaymentSkeleton;
