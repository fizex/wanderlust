import React, { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Activity } from '../types/itinerary';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TextCardProps {
  activity: Activity;
  onDelete: () => void;
  onEdit: (updatedActivity: Activity) => void;
}

export default function TextCard({ activity, onDelete, onEdit }: TextCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(activity.description);

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

  const handleBlur = () => {
    setIsEditing(false);
    onEdit({ ...activity, description: text });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md border-2 border-gray-100"
    >
      <div className="absolute top-3 left-2 cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="p-4 pl-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <TextareaAutosize
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                minRows={2}
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="prose prose-sm max-w-none cursor-text"
              >
                {text || 'Click to add text...'}
              </div>
            )}
          </div>
          <button
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