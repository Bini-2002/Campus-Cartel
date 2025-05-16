import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-left">
      <Link to="/login" className="navbar-btn">Login</Link>
      <Link to="/register" className="navbar-btn">Register</Link>
    </div>
    <div className="navbar-center">
      <span className="navbar-motivation">Empower Your Campus Journey 🚀</span>
    </div>
    <div className="navbar-right">
      <Link to="/" className="navbar-link">Home</Link>
      <Link to="/profile" className="navbar-link">Profile</Link>
      <Link to="/groups" className="navbar-link">Groups</Link>
    </div>
  </nav>
);

export default Navbar;