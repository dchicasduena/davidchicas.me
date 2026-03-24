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
                <h3 className="mb-4 desc">Spotify playlist generator based on genres and sub-genres</h3>
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
                      <h3 className="mb-4 desc">
                        Used the Spotify API to create playlists and add songs. The application was built in Node.js and uses MongoDB to connect with all the songs.
                        The application follows an MVC structure.
                      </h3>
                    </div>

                    <h3 className="mb-4 desc fw-bold">Things Used</h3>
                    <h3 className="mb-4 desc">- Spotify API</h3>
                    <h3 className="mb-4 desc">- Node.js</h3>
                    <h3 className="mb-4 desc">- MongoDB</h3>
                    <h3 className="mb-4 desc">- Bootstrap</h3>
                    
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