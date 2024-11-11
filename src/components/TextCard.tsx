import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, Trash2, Link as LinkIcon } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Activity } from '../types/itinerary';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

interface TextCardProps {
  activity: Activity;
  onDelete: () => void;
  onEdit: (updatedActivity: Activity) => void;
  autoFocus?: boolean;
}

export default function TextCard({ activity, onDelete, onEdit, autoFocus }: TextCardProps) {
  const [isEditing, setIsEditing] = useState(autoFocus || false);
  const [text, setText] = useState(activity.description);
  const [websiteUrl, setWebsiteUrl] = useState(activity.details?.website || '');
  const [showUrlField, setShowUrlField] = useState(!!activity.details?.website);
  const cardRef = useRef<HTMLDivElement>(null);

  // Update local state when activity changes
  useEffect(() => {
    setText(activity.description);
    setWebsiteUrl(activity.details?.website || '');
  }, [activity]);

  // Handle clicks outside the card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, text, websiteUrl]);

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

  const handleSave = () => {
    // Don't save if there's no content
    if (!text.trim() && !websiteUrl) {
      return;
    }

    // Basic URL validation for website
    let finalWebsiteUrl = websiteUrl.trim();
    if (finalWebsiteUrl && !finalWebsiteUrl.startsWith('http')) {
      finalWebsiteUrl = `https://${finalWebsiteUrl}`;
    }

    const updatedActivity = {
      ...activity,
      description: text.trim(),
      details: {
        ...activity.details,
        website: finalWebsiteUrl || undefined,
      },
    };

    onEdit(updatedActivity);
    setIsEditing(false);
  };

  const handleStartEditing = (e: React.MouseEvent) => {
    // Prevent editing when clicking links
    if ((e.target as HTMLElement).tagName === 'A') {
      return;
    }
    setIsEditing(true);
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (cardRef) cardRef.current = node;
      }}
      style={style}
      className={`group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md border-2 ${
        isEditing ? 'border-indigo-200' : 'border-gray-100'
      }`}
    >
      <div className="absolute top-3 left-2 cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="p-4 pl-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4 w-full">
            {isEditing ? (
              <>
                <TextareaAutosize
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  minRows={2}
                  autoFocus={autoFocus}
                  placeholder="Enter your note..."
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlField(!showUrlField)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {showUrlField ? 'Remove URL' : 'Add URL'}
                  </button>
                </div>

                {showUrlField && (
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="Enter website URL"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div 
                onClick={handleStartEditing}
                className="space-y-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              >
                {text && (
                  <div className="prose prose-sm max-w-none">
                    {text}
                  </div>
                )}
                
                {activity.details?.website && (
                  <a
                    href={activity.details.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Visit website
                  </a>
                )}

                {!text && !activity.details?.website && (
                  <div className="text-gray-400 italic">
                    Click to add content...
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}