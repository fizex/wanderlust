import React from 'react';
import { Star, Clock, MapPin, Globe, Tag, Trash2, GripVertical } from 'lucide-react';
import { Activity } from '../types/itinerary';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ActivityCardProps {
  activity: Activity;
  onDelete: () => void;
  onEdit: (updatedActivity: Activity) => void;
}

export default function ActivityCard({ activity, onDelete, onEdit }: ActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderRating = (rating: number | string | undefined) => {
    if (!rating) return null;
    
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (isNaN(numericRating)) return null;

    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-sm font-medium">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  const renderTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md border border-gray-100"
    >
      <div className="absolute top-0 left-0 p-3 cursor-grab touch-none z-10" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="p-4 pl-12">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
            {activity.details?.location && (
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{activity.details.location}</span>
              </div>
            )}
          </div>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-2 text-gray-600">{activity.description}</p>

        {activity.details && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {activity.details.rating !== undefined && renderRating(activity.details.rating)}
              {activity.details.duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{activity.details.duration}</span>
                </div>
              )}
              {activity.details.price && (
                <div className="font-medium text-gray-900">{activity.details.price}</div>
              )}
            </div>

            {activity.details.website && (
              <a
                href={activity.details.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Globe className="w-4 h-4 mr-1" />
                <span>Visit website</span>
              </a>
            )}

            {activity.details.tags && renderTags(activity.details.tags)}
          </div>
        )}
      </div>
    </div>
  );
}