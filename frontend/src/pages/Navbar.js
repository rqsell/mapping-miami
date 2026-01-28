import React, { useState } from "react";
import { Link } from "react-router-dom";
import MapMiami from "../images/mapping-miami-light.png"
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>
       <img src={MapMiami} style={{width:"15vw"}} alt="Map Miami" />
        </Link>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <div className={isOpen ? "bar open" : "bar"}></div>
        <div className={isOpen ? "bar open" : "bar"}></div>
        <div className={isOpen ? "bar open" : "bar"}></div>
      </div>

      <ul className={isOpen ? "nav-links open" : "nav-links"}>
        <li>
          <Link to="/" onClick={closeMenu}>Home</Link>
        </li>
          <li>
          <Link to="/about" onClick={closeMenu}>About</Link>
        </li>
        <li>
          <Link to="/map" onClick={closeMenu}>Map</Link>
        </li>
        <li>
          <Link to="/add-item" onClick={closeMenu}>Add Item</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
