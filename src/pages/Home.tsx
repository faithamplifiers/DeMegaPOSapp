import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedServices from '../components/home/FeaturedServices';
import FeaturedNews from '../components/home/FeaturedNews';
import UpcomingEvents from '../components/home/UpcomingEvents';
import DirectorySection from '../components/home/DirectorySection';
import ResourcesSection from '../components/home/ResourcesSection';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <FeaturedServices />
      <FeaturedNews />
      <UpcomingEvents />
      <DirectorySection />
      <ResourcesSection />
      <Testimonials />
      <CallToAction />
    </div>
  );
};

export default Home;