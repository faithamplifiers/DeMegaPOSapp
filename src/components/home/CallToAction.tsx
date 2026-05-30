import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Amplify Your Faith Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-10">
            Join our community today to access exclusive content, connect with like-minded believers, and discover professional services to enhance your ministry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn bg-secondary text-primary hover:bg-secondary-light text-lg px-8 py-3">
              Join Now
            </Link>
            <Link to="/services" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;