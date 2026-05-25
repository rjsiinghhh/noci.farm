'use client';

import React, { useEffect } from 'react';
import { FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { FaCircleCheck } from 'react-icons/fa6';
import './AlertModal.css';

const AlertModal = ({
  isOpen,
  message,
  type = 'info',
  variant = 'alert', // 'alert' or 'confirm'
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCircleCheck className="alert-modal-icon" />;
      case 'error':
        return <FaExclamationCircle className="alert-modal-icon" />;
      case 'info':
      default:
        return <FaInfoCircle className="alert-modal-icon" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'info':
      default:
        return variant === 'confirm' ? 'Confirm' : 'Information';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className="alert-modal-overlay"
      onClick={variant === 'alert' ? onClose : undefined}
    >
      <div className="alert-modal" onClick={e => e.stopPropagation()}>
        <div className="alert-modal-content">
          {variant === 'alert' && (
            <div
              className={`alert-modal-icon-wrapper alert-modal-icon-${type}`}
            >
              {getIcon()}
            </div>
          )}
          <h3 className="alert-modal-title">{getTitle()}</h3>
          <p className="alert-modal-message">{message}</p>
          <div className="alert-modal-buttons">
            {variant === 'confirm' ? (
              <>
                <button
                  className="alert-modal-button alert-modal-button-cancel"
                  onClick={handleCancel}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  className="alert-modal-button alert-modal-button-confirm"
                  onClick={handleConfirm}
                  aria-label="Confirm"
                >
                  OK
                </button>
              </>
            ) : (
              <button
                className="alert-modal-button"
                onClick={onClose}
                aria-label="Close alert"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
