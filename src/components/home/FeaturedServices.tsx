import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Image, Music, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '../../lib/api';

const FeaturedServices: React.FC = () => {
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: fetchServices });
  // Filter featured services
  const featuredServices = services?.filter(service => service.featured) || [];

  return (
    <section className="section bg-light-gray dark:bg-gray-800">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Our Professional Services</h2>
          <p className="section-subtitle mx-auto">
            Elevate your ministry with our comprehensive range of professional services designed to amplify your message and reach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Service 1: Livestreaming */}
          <ServiceCard
            icon={<Video className="w-10 h-10 text-secondary" />}
            title="Livestreaming"
            description="Professional multi-camera livestreaming for church services, concerts, and special events."
            link="/services/livestreaming"
          />

          {/* Service 2: Graphics Design */}
          <ServiceCard
            icon={<Image className="w-10 h-10 text-secondary" />}
            title="Graphics Design"
            description="Custom graphics for social media, event promotions, church bulletins, and more."
            link="/services/graphics-design"
          />

          {/* Service 3: Video Coverage */}
          <ServiceCard
            icon={<Music className="w-10 h-10 text-secondary" />}
            title="Video Coverage"
            description="Cinematic video production for events, testimonials, and ministry highlights."
            link="/services/video-coverage"
          />

          {/* Service 4: Event Production */}
          <ServiceCard
            icon={<Calendar className="w-10 h-10 text-secondary" />}
            title="Event Production"
            description="End-to-end event management including venue setup, sound, lighting, and coordination."
            link="/services/event-production"
          />
        </div>

        <div className="mt-12 text-center">
          <Link to="/services" className="btn btn-primary">
            View All Services
          </Link>
        </div>

        {/* Featured service showcase */}
        <div className="mt-16">
          <h3 className="text-xl font-bold mb-8 text-center">Featured Service Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div key={service.id} className="card group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.coverImage}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 bg-secondary text-primary text-sm font-medium rounded-full mb-2">
                      {(service.category || 'service').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <h4 className="text-white font-bold">{service.title}</h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(service.rating)
                                ? 'text-secondary'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                        {(service.rating || 5).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-primary dark:text-white font-bold">
                      {service.price}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {(service.description || '').length > 100
                      ? `${(service.description || '').substring(0, 100)}...`
                      : service.description}
                  </p>
                  <Link
                    to={`/services/${service.slug}`}
                    className="btn btn-outline w-full text-center"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  link,
}) => (
  <div className="card h-full transition-transform hover:-translate-y-2">
    <div className="p-6 flex flex-col h-full">
      <div className="bg-primary/5 dark:bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{description}</p>
      <Link to={link} className="text-secondary font-medium hover:underline">
        Learn More →
      </Link>
    </div>
  </div>
);

export default FeaturedServices;