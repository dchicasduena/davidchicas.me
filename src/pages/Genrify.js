import React from 'react';
import genrifyImage from '../assets/img/genrify2.png'; 

const Genrify = () => {
  return (
    <div>
      {/* Main Content */}
      <main id="main">
        <section className="section">
          <div className="container">
            <div className="row mb-4 align-items-center">
              {/* Title and Description */}
              <div className="col-md-12 aos-init aos-animate" data-aos="fade-up">
                <h2><b>Genrify</b></h2>
                <h3 className="mb-0 desc">Spotify playlist generator based on genres and sub-genres</h3>
              </div>
            </div>
          </div>

          <div className="site-section pb-0">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6 aos-init aos-animate" data-aos="fade-up">
                  <img
                    src={genrifyImage} 
                    alt="Genrify"
                    onClick={() => window.open('https://genrify-app.herokuapp.com')}
                    className="img-fluid"
                  />
                </div>
                
                <div className="col-md-4 aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
                  <div className="sticky-content desc" style={{ fontSize: '22px' }}>
                    <div>
                      <p>
                        Used the Spotify API to create playlists and add songs. The application was built in Node.js and uses MongoDB to connect with all the songs.
                        The application follows an MVC structure.
                      </p>
                    </div>

                    <h5 >Things Used</h5>
                    <ul className="list-unstyled list-line mb-5">
                      <li>Spotify API</li>
                      <li>Node.js</li>
                      <li>MongoDB</li>
                      <li>Bootstrap</li>
                    </ul>

                    <p>
                      <a
                        href="https://github.com/dchicasduena/genrify"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="readmore"
                      >
                        Visit Repo
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Genrify;