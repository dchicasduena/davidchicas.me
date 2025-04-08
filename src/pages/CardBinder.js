import React from 'react';
import cardBinderImage from '../assets/img/cardbinder2.png'; 

const CardBinder = () => {
  return (
    <div>
      {/* Main Content */}
      <main id="main">
        <section className="section">
          <div className="container">
            <div className="row mb-4 align-items-center">
              {/* Title and Description */}
              <div className="col-md-12 aos-init aos-animate" data-aos="fade-up">
                <h2><b>Card Binder</b></h2>
                <h3 className="mb-0 desc">Visualize your Pokémon TCG binder</h3>
              </div>
            </div>
          </div>

          <div className="site-section pb-0">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6 aos-init aos-animate" data-aos="fade-up">
                  <img
                    src={cardBinderImage} 
                    alt="Card Binder"
                    onClick={() => window.open('https://card-binder.netlify.app/')}
                    className="img-fluid"
                  />
                </div>
                
                <div className="col-md-4 aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
                  <div className="sticky-content desc" style={{ fontSize: '22px' }}>
                    <div>
                      <p>
                      Plan your PTCG binder, this web app allows you to add cards to your binder and download an image. You can search for cards by name or set. The app uses the Pokémon TCG API to fetch card data.
                      </p>
                    </div>

                    <h5 >Things Used</h5>
                    <ul className="list-unstyled list-line mb-5">
                      <li>Pokémon TCG API</li>
                      <li>React</li>
                    </ul>

                    <p>
                      <a
                        href="https://github.com/dchicasduena/card.binder"
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

export default CardBinder;