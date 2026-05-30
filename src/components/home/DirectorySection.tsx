import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDirectory } from '../../lib/api';

const DirectorySection: React.FC = () => {
  const { data: directoryListings } = useQuery({ queryKey: ['directoryListings'], queryFn: fetchDirectory });
  // Get a few directory listings for preview
  const previewListings = directoryListings?.slice(0, 4) || [];

  return (
    <section className="section bg-light-gray dark:bg-gray-800">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Gospel Business Directory</h2>
          <p className="section-subtitle mx-auto">
            Connect with trusted professionals and businesses in the gospel community.
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for businesses, services, or categories..."
              className="w-full px-5 py-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['All', 'Audio Equipment', 'Gospel Artists', 'Caterers', 'Sound Engineers', 'Event Planners', 'Videographers'].map(category => (
            <Link
              key={category}
              to={category === 'All' ? '/directory' : `/directory/category/${category.toLowerCase().replace(' ', '-')}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === 'All'
                  ? 'bg-secondary text-primary'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </Link>
          ))}
        </div>

        {/* Directory listings preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewListings.map(listing => (
            <div key={listing.id} className="card group hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={listing.logo}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{listing.name}</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {listing.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(listing.rating)
                            ? 'text-secondary fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {(listing.rating || 5).toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {listing.description}
                </p>
                <Link
                  to={`/directory/${listing.slug}`}
                  className="text-secondary font-medium hover:underline text-sm"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/directory" className="btn btn-primary">
            Explore Full Directory
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DirectorySection;