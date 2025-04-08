import React from 'react';

const Header = () => {
  return (
    <div className="collapse navbar-collapse custom-navmenu" id="main-navbar">
      <div className="container py-2 py-md-5">
        <div className="row align-items-start">
          <div className="col-md-2">
            <ul className="custom-menu">
              <li className="active"><a href="#home">home</a></li>
              <li><a href="#about">about me</a></li>
              <li><a href="#projects">projects</a></li>
              <li><a href="#contact">contact</a></li>
            </ul>
          </div>
          <div className="col-md-6 d-none d-md-block mr-auto">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
