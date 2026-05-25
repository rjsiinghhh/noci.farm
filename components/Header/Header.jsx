import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuShoppingCart } from 'react-icons/lu';
import { HiOutlineTruck } from 'react-icons/hi2';
import { useCart } from '@/contexts/CartContext';
import './Header.css';

const Header = () => {
  const { state, toggleCart } = useCart();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="header ">
      <div className="container">
        <div className="header-content">
          <div className="header-start" />
          <Link href="/" className="header-logo">
            <h2 className="logo">Noci</h2>
          </Link>
          <div className="header-end">
            <Link href="/track-order" className="header-tracking-btn">
              <HiOutlineTruck color="#ffffff" size={18} />
            </Link>
            {isHomePage && (
              <button className="header-cart-btn" onClick={toggleCart}>
                <LuShoppingCart color="#ffffff" size={18} />
                {state.totalItems > 0 && (
                  <span className="header-cart-badge">
                    {state.totalItems > 99 ? '99+' : state.totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
