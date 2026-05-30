import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

const FeaturedNews: React.FC = () => {
  const { data: articles } = useQuery({ queryKey: ['articles'], queryFn: fetchNews });

  // Get featured articles
  const featuredArticles = articles?.filter(article => article.featured) || [];
  // Get other recent articles
  const recentArticles = articles
    ?.filter(article => !article.featured)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3) || [];

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="section-title">Latest Gospel News</h2>
            <p className="section-subtitle">
              Stay informed with the latest happenings in the gospel community.
            </p>
          </div>
          <Link to="/news" className="btn btn-outline mt-4 md:mt-0">
            View All News
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured article - larger card */}
          <div className="lg:col-span-2">
            {featuredArticles.length > 0 && (
              <div className="card group h-full">
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={featuredArticles[0].coverImage}
                    alt={featuredArticles[0].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-secondary text-primary text-sm font-medium rounded-full">
                      {(featuredArticles[0].category || 'news').charAt(0).toUpperCase() + (featuredArticles[0].category || 'news').slice(1)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center mr-4">
                      <img
                        src={featuredArticles[0].author.avatar}
                        alt={featuredArticles[0].author.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span>{featuredArticles[0].author.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(featuredArticles[0].publishedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    <Link to={`/news/${featuredArticles[0].slug}`} className="hover:text-secondary transition-colors">
                      {featuredArticles[0].title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {featuredArticles[0].excerpt}
                  </p>
                  <Link
                    to={`/news/${featuredArticles[0].slug}`}
                    className="text-secondary font-medium hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Recent articles - smaller cards */}
          <div className="space-y-6">
            {recentArticles.map(article => (
              <div key={article.id} className="card flex flex-col sm:flex-row group">
                <div className="sm:w-1/3 relative h-40 sm:h-auto overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="sm:w-2/3 p-4">
                  <span className="inline-block px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary text-xs font-medium rounded mb-2">
                    {(article.category || 'news').charAt(0).toUpperCase() + (article.category || 'news').slice(1)}
                  </span>
                  <h3 className="text-lg font-bold mb-2">
                    <Link to={`/news/${article.slug}`} className="hover:text-secondary transition-colors">
                      {article.title}
                    </Link>
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;