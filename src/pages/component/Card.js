import React from 'react';

const Card = () => {
  return (
    <div className="my-4 d-flex justify-content-center align-items-center">
      <div className="card" style={{ width: '40rem' }}>
        <img src="/man.jpg" className="card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title">Card title</h5>
          <p className="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </p>
          <a href="#" className="btn btn-primary">
            Go somewhere
          </a>
        </div>
      </div>
    </div>
  );
};

export default Card;
