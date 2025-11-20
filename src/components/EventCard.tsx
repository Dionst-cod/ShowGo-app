import { Calendar, Clock, MapPin, Tag } from 'lucide-react';
import { useState } from 'react';

interface EventCardProps {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  category: string;
  onViewDetails: () => void;
}

export default function EventCard({
  name,
  description,
  imageUrl,
  location,
  venue,
  eventDate,
  eventTime,
  category,
  onViewDetails,
}: EventCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:-translate-y-1 flex flex-col h-full">
      <div className="relative w-full h-56 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        <img
          src={imageUrl}
          alt={name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-purple-500/30">
          <Tag size={14} />
          {category}
        </span>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-3">
          {name}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={14} className="text-purple-400 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{location}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Calendar size={14} className="text-purple-400 flex-shrink-0" />
            <span className="text-sm font-medium">{formatDate(eventDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={14} className="text-purple-400 flex-shrink-0" />
            <span className="text-sm font-medium">{eventTime}</span>
          </div>
        </div>

        <button
          onClick={onViewDetails}
          className="w-full px-6 py-2 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-500 rounded-lg font-medium transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
