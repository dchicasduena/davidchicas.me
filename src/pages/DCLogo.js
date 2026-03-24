import React from 'react';
import DCLogoGif from '../assets/img/dclogo2.gif'; 

const DCLogo = () => {
    return (
      <div>
        <main id="main">
          <section className="section">
            <div className="container">
              <div className="row mb-4 align-items-center">
                <div className="col-md-6 aos-init aos-animate" data-aos="fade-up">
                  <h2><b>Website Logo</b></h2>
                  <h3 className="mb-4 desc">
                    designed the logo for this website, created in Illustrator and animated in After Effects
                  </h3>
                  <br />
                </div>
                <img
                  src={DCLogoGif}
                  onClick={() => window.open(DCLogoGif)}
                  className="img-fluid"
                  alt="Website Logo"
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  };
  
  export default DCLogo;