import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Build Your Perfect Resume with AI
        </h1>
        <p className="text-lg mb-8">
          Create a professional resume effortlessly and land your dream job.
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get Started Now
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
