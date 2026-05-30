import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search as SearchIcon, Loader, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SearchResult {
  id: string;
  title: string;
  type: 'article' | 'event' | 'service' | 'resource';
  url: string;
  description?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'faith_amplifiers_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches on mount
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches');
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Clear query when closed
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const searchData = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search in content table
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('id, title, excerpt')
          .ilike('title', `%${query}%`)
          .or(`excerpt.ilike.%${query}%`)
          .limit(5);

        // Search in events table
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title, description')
          .ilike('title', `%${query}%`)
          .or(`description.ilike.%${query}%`)
          .limit(5);

        // Search in services table
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, title, description')
          .ilike('title', `%${query}%`)
          .or(`description.ilike.%${query}%`)
          .limit(5);

        const allResults: SearchResult[] = [
          ...(contentData || []).map(item => ({
            id: item.id,
            title: item.title,
            type: 'article' as const,
            url: `/news/${item.id}`,
            description: item.excerpt
          })),
          ...(eventsData || []).map(item => ({
            id: item.id,
            title: item.title,
            type: 'event' as const,
            url: `/events/${item.id}`,
            description: item.description
          })),
          ...(servicesData || []).map(item => ({
            id: item.id,
            title: item.title,
            type: 'service' as const,
            url: `/services/${item.id}`,
            description: item.description
          }))
        ];

        setResults(allResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    let updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)];
    if (updated.length > MAX_RECENT_SEARCHES) {
      updated = updated.slice(0, MAX_RECENT_SEARCHES);
    }
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    navigate(result.url);
    onClose();
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const removeRecentSearch = (e: React.MouseEvent, searchTerm: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-3xl mx-auto mt-16 rounded-lg shadow-xl overflow-hidden">
        <div className="relative">
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <SearchIcon className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              className="w-full px-4 py-2 text-lg border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500"
              placeholder="Search everything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 mx-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-secondary animate-spin" />
              </div>
            ) : query.trim() === '' ? (
              /* Recent Searches Section */
              recentSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Searches</h3>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {recentSearches.map((term, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleRecentSearchClick(term)}
                          className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors group"
                        >
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <Clock className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{term}</span>
                          </div>
                          <div 
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ) : results.length > 0 ? (
              /* Search Results */
              results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {result.title}
                      </h4>
                      {result.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      <span className="mt-2 inline-block px-2 py-1 text-xs font-medium text-secondary bg-secondary/10 rounded-full">
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <SearchIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-2">Try different keywords or check spelling.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;