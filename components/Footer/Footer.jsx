import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { FaEnvelope, FaInstagram } from 'react-icons/fa';
import { FaPhone, FaTiktok } from 'react-icons/fa6';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <Link href="/" className="footer-logo">
            <Image
              src="/images/footer-logo.jpeg"
              alt="NOCI Farm Logo"
              width={210}
              height={65}
              className="footer-logo-image"
            />
          </Link>
          {/* <p className="footer-text">
            We bring you the finest quality walnuts, handpicked from trusted
            farms and packed with care to preserve their natural taste, crunch,
            and nutrition.
          </p> */}
          {/* <div className="footer-contact">
            <div className="footer-contact-item">
              <FaEnvelope size={16} />
              <a href="mailto:rj@noci.farm" className="footer-contact-link">
                rj@noci.farm
              </a>
            </div>
          </div> */}

          <div className="footer-socials">
            <a href="mailto:rj@noci.farm" className="footer-social">
              <FaEnvelope size={18} />
            </a>
            {/* <a
              href="https://www.tiktok.com/@noci.farm"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
            >
              <FaTiktok size={18} />
            </a> */}
            <a
              href="https://www.instagram.com/noci.farm/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
            >
              <FaInstagram size={18} />
            </a>
          </div>
        </div>

        <p className="footer-copyright-text">Est. 2025 - All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
