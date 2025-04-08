import React from 'react';
import TFMMImage from '../assets/img/tfmm2.jpg'; 

const TFMMM = () => {
  return (
    <div>
      {/* Main Content */}
      <main id="main">
        <section className="section">
          <div className="container">
            <div className="row mb-4 align-items-center">
              {/* Title and Description */}
              <div className="col-md-12 aos-init aos-animate" data-aos="fade-up">
                <h2><b>Thirty Five mm</b></h2>
                <h3 className="mb-0 desc">a portfolio of pictures i've taken, mostly in 35mm film</h3>
              </div>
            </div>
          </div>

          <div className="site-section pb-0">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6 aos-init aos-animate" data-aos="fade-up">
                  <img
                    src={TFMMImage} 
                    alt="thirty five millimeter"
                    onClick={() => window.open('https://dchicasduena.github.io/thirty-five-mm/')}
                    className="img-fluid"
                  />
                </div>
                
                <div className="col-md-4 aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
                  <div className="sticky-content desc" style={{ fontSize: '22px' }}>
                    <div>
                      <p>
                        For this website I used Bootstrap to keep responsive, so it works on mobile too. 
                        I use this place to show some pictures I have taken but most importantly to practice making websites.
                      </p>
                    </div>

                    <h5 >Things Used</h5>
                    <ul className="list-unstyled list-line mb-5">
                        <li>Bootstrap</li>
                        <li>HTML5/CSS3</li>
                        <li>Github pages</li>
                        <li>35mm camera</li>
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

export default TFMMM;