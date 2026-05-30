import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../../lib/api';
import { format } from 'date-fns';

const UpcomingEvents: React.FC = () => {
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });

  // Sort events by date (closest first)
  const upcomingEvents = (events ? [...events] : [])
    .sort((a, b) => new Date(a.startDate || Date.now()).getTime() - new Date(b.startDate || Date.now()).getTime())
    .slice(0, 3);

  return (
    <section className="section bg-primary text-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Upcoming Events</h2>
            <p className="text-gray-300 mb-6 max-w-3xl">
              Discover and connect with faith-based events happening in your community and beyond.
            </p>
          </div>
          <Link to="/events" className="btn bg-white text-primary hover:bg-gray-100 mt-4 md:mt-0">
            View All Events
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map(event => (
            <div key={event.id} className="bg-primary-light rounded-lg overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-secondary text-primary text-sm font-medium rounded-full">
                    {(event.type || 'event').charAt(0).toUpperCase() + (event.type || 'event').slice(1)}
                  </span>
                </div>
                {/* Date badge */}
                <div className="absolute top-4 right-4 bg-white text-primary rounded-lg overflow-hidden shadow-lg">
                  <div className="bg-secondary px-3 py-1 text-center">
                    <span className="text-xs font-bold uppercase">
                      {format(new Date(event.startDate || Date.now()), 'MMM')}
                    </span>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <span className="text-xl font-bold">
                      {format(new Date(event.startDate || Date.now()), 'd')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">
                  <Link to={`/events/${event.slug}`} className="hover:text-secondary transition-colors">
                    {event.title}
                  </Link>
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-secondary" />
                    <span>
                      {format(new Date(event.startDate || Date.now()), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-secondary" />
                    <span>
                      {format(new Date(event.startDate || Date.now()), 'h:mm a')} - {format(new Date(event.endDate || Date.now()), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 text-secondary" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to={`/events/${event.slug}`}
                    className="btn bg-primary-dark hover:bg-primary text-white flex-1 text-center"
                  >
                    Details
                  </Link>
                  {event.ticketUrl && (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary flex-1 text-center"
                    >
                      Get Tickets
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;