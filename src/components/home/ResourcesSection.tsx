import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Headphones, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchResources } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

const ResourcesSection: React.FC = () => {
  const { data: resources } = useQuery({ queryKey: ['resources'], queryFn: fetchResources });
  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Spiritual Growth Resources</h2>
          <p className="section-subtitle mx-auto">
            Discover videos, podcasts, and devotionals to strengthen your faith journey.
          </p>
        </div>

        {/* Resource type tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button className="px-6 py-3 rounded-lg bg-secondary text-primary font-medium">
            All Resources
          </button>
          <button className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Videos
          </button>
          <button className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Podcasts
          </button>
          <button className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Devotionals
          </button>
        </div>

        {/* Resources grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources?.map(resource => (
            <div key={resource.id} className="card group overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={resource.coverImage}
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                {/* Resource type icon */}
                <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-full">
                  {resource.type === 'video' && (
                    <Video className="w-5 h-5 text-secondary" />
                  )}
                  {resource.type === 'podcast' && (
                    <Headphones className="w-5 h-5 text-secondary" />
                  )}
                  {resource.type === 'devotional' && (
                    <BookOpen className="w-5 h-5 text-secondary" />
                  )}
                </div>
                
                {/* Published date */}
                <div className="absolute bottom-4 left-4 text-white text-sm">
                  <span>
                    {formatDistanceToNow(new Date(resource.publishedAt || Date.now()), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">
                  <a href={resource.url} className="hover:text-secondary transition-colors">
                    {resource.title}
                  </a>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {resource.description}
                </p>
                <a
                  href={resource.url}
                  className="btn btn-outline w-full text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.type === 'video' && 'Watch Now'}
                  {resource.type === 'podcast' && 'Listen Now'}
                  {resource.type === 'devotional' && 'Read Now'}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/resources" className="btn btn-primary">
            Browse All Resources
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;