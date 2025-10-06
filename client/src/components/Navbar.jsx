import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { logout, userDetails } = useContext(GeneralContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const getUserRole = () => {
    if (!userDetails) return 'Guest';
    if (userDetails.usertype === 'admin') return 'Administrator';
    if (userDetails.usertype === 'flight-operator') return 'Flight Operator';
    return 'Customer';
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-logo" onClick={() => handleNavigation('/')}>
        <h3>FlyNow</h3>
      </div>

      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-options ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <p 
          className={isActive('/')}
          onClick={() => handleNavigation('/')}
        >
          Home
        </p>
        {userDetails && (
          <p
            className={isActive('/bookings')}
            onClick={() => handleNavigation('/bookings')}
          >
            My Bookings
          </p>
        )}
        
        {userDetails?.usertype === 'admin' && (
          <p 
            className={isActive('/admin')}
            onClick={() => handleNavigation('/admin')}
          >
            Admin Dashboard
          </p>
        )}
        
        {userDetails?.usertype === 'flight-operator' && (
          <p
            className={isActive('/flight-admin')}
            onClick={() => handleNavigation('/flight-admin')}
          >
            Operator Dashboard
          </p>
        )}

        {userDetails ? (
          <p onClick={logout}>Logout</p>
        ) : (
          <p onClick={() => handleNavigation('/auth')}>Login</p>
        )}
      </div>

      {userDetails && (
        <div className="navbar-user">
          <div className="user-avatar">
            {getInitials(userDetails.username)}
          </div>
          <div className="user-info">
            <div className="user-name">{userDetails.username}</div>
            <div className="user-role">{getUserRole()}</div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;