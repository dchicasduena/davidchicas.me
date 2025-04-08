import logoNormal from '../assets/img/logos/logo normal.svg'; 
import animatedLogo from '../assets/img/logos/animated/dc animated.webm';
import { useLocation } from 'react-router-dom';


const Home = () => {
  const handleMouseOver = (e) => {
    e.target.play();
  };

  const handleMouseOut = (e) => {
    e.target.pause();
    e.target.currentTime = 0; 
  };

  const location = useLocation();
  const isNotHomePage = location.pathname !== '/';

  return (
    <nav id="home" className="navbar navbar-light custom-navbar">
      <div className="container">
        <a className="navbar-brand" href="/">
          <div className="logo">
            {/* Animated Logo Video */}
            <video
              className="logo hide"
              muted
              data-was-processed="true"
              onMouseOver={handleMouseOver}
            >
            <source type="video/webm" src={animatedLogo} />
            </video>

            {/* Static Logo Image */}
            <img
              src={logoNormal}
              className="logo hide"
              id="logo"
              alt="Logo"
            />
          </div>
        </a>

        <div className="icons">
          <a
            style={{ color: '#7386D5' }}
            href="https://ca.linkedin.com/in/davidchicas"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-linkedin fa-xl fa-fw"></i>
          </a>
          <a
            style={{ color: '#7386D5' }}
            href="https://github.com/dchicasduena"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-github fa-xl fa-fw"></i>
          </a>
          <a
            style={{ color: '#7386D5' }}
            href="https://davidchicas.me/assets/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-solid fa-file fa-xl fa-fw"></i>
          </a>
          <a style={{ color: '#7386D5' }} className="icon-cont" href="mailto:contact@davidchicas.me">
            <i className="fa-solid fa-envelope fa-xl fa-fw"></i>
          </a>
            {isNotHomePage ? (
              <a href="/"><i className="fa-solid fa-arrow-left fa-xl fa-fw" style={{ color: 'black', paddingLeft: '1rem' }}></i></a>
            ) : (
              <a
                href="#"
                id="burger"
                className="burger"
                onClick={(e) => {
                  e.preventDefault();
                  const nav = document.getElementById('main-navbar');
                  nav.classList.toggle('show');
                }}
              >
                <i
                  className="fa-solid fa-bars fa-xl fa-fw"
                  style={{ color: 'black', paddingLeft: '1rem' }}
                ></i>
              </a>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Home;
