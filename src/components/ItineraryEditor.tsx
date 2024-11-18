import React, { useState, useCallback } from 'react';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { ItineraryDay, Activity } from '../types/itinerary';
import ActivityCard from './ActivityCard';
import KiwiAdPanel from './ads/KiwiAdPanel';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const loadingMessages = [
  "Crafting your perfect adventure...",
  "Discovering hidden gems...",
  "Planning unforgettable moments...",
  "Curating unique experiences...",
  "Mapping out your journey..."
];

interface ItineraryEditorProps {
  itinerary: ItineraryDay[];
  setItinerary: (days: ItineraryDay[]) => void;
  destination: string;
  loading: boolean;
  error: string | null;
  openAIClient: any;
}

export default function ItineraryEditor({ 
  itinerary, 
  setItinerary, 
  destination,
  loading, 
  error, 
  openAIClient 
}: ItineraryEditorProps) {
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);

  React.useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Ensure all days and activities have valid IDs
  const normalizedItinerary = React.useMemo(() => {
    return itinerary.map((day, dayIndex) => {
      const dayId = day.id || `day-${dayIndex}-${Date.now()}`;
      return {
        ...day,
        id: dayId,
        activities: day.activities.map((activity, activityIndex) => ({
          ...activity,
          id: activity.id || `activity-${dayId}-${activityIndex}-${Date.now()}`
        }))
      };
    });
  }, [itinerary]);

  const findDayAndActivity = useCallback((id: string) => {
    for (const day of normalizedItinerary) {
      const activity = day.activities.find(a => a.id === id);
      if (activity) {
        return { day, activity };
      }
    }
    return null;
  }, [normalizedItinerary]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    document.body.classList.add('dragging');

    const activeData = findDayAndActivity(String(active.id));
    if (activeData) {
      setActiveActivity(activeData.activity);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = findDayAndActivity(String(active.id));
    const overData = findDayAndActivity(String(over.id));

    if (!activeData || !overData) return;

    const activeDay = activeData.day;
    const overDay = overData.day;

    if (activeDay.id !== overDay.id) {
      const newItinerary = [...normalizedItinerary];
      const sourceDayIndex = newItinerary.findIndex(d => d.id === activeDay.id);
      const destDayIndex = newItinerary.findIndex(d => d.id === overDay.id);
      
      if (sourceDayIndex === -1 || destDayIndex === -1) return;

      const [movedActivity] = newItinerary[sourceDayIndex].activities.splice(
        newItinerary[sourceDayIndex].activities.findIndex(a => a.id === active.id),
        1
      );

      const overIndex = newItinerary[destDayIndex].activities.findIndex(a => a.id === over.id);
      if (overIndex === -1) {
        newItinerary[destDayIndex].activities.push(movedActivity);
      } else {
        newItinerary[destDayIndex].activities.splice(overIndex, 0, movedActivity);
      }

      setItinerary(newItinerary);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveActivity(null);
    document.body.classList.remove('dragging');

    if (!over || active.id === over.id) return;

    const activeData = findDayAndActivity(String(active.id));
    const overData = findDayAndActivity(String(over.id));

    if (!activeData || !overData) return;

    const activeDay = activeData.day;
    const overDay = overData.day;

    if (activeDay.id === overDay.id) {
      const newItinerary = normalizedItinerary.map(day => {
        if (day.id !== activeDay.id) return day;

        const oldIndex = day.activities.findIndex(a => a.id === active.id);
        const newIndex = day.activities.findIndex(a => a.id === over.id);

        const activities = [...day.activities];
        const [removed] = activities.splice(oldIndex, 1);
        activities.splice(newIndex, 0, removed);

        return { ...day, activities };
      });

      setItinerary(newItinerary);
    }
  };

  const handleAddActivity = (dayId: string) => {
    const timestamp = Date.now();
    const newActivity: Activity = {
      id: `activity-${dayId}-${timestamp}`,
      type: 'custom',
      title: 'Note',
      description: '',
    };

    const newItinerary = normalizedItinerary.map(day =>
      day.id === dayId
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    );

    setItinerary(newItinerary);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-gray-600 animate-fade-in">{loadingMessages[loadingMessageIndex]}</p>
        <p className="text-sm text-gray-500">Please wait while we generate your personalized itinerary (15-40 seconds)</p>
      </div>
    );
  }

  if (!Array.isArray(normalizedItinerary) || normalizedItinerary.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Calendar className="w-8 h-8 text-gray-400" />
        <p className="text-gray-600">No itinerary available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-12">
          {normalizedItinerary.map((day, index) => {
            const dayActivities = day.activities.map(activity => activity.id);
            
            return (
              <React.Fragment key={day.id}>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-6">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-medium">Day {day.day}</h3>
                    {day.location && (
                      <span className="text-gray-500">- {day.location}</span>
                    )}
                  </div>

                  <SortableContext items={dayActivities} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 gap-6">
                      {day.activities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onDelete={() => {
                            const newItinerary = normalizedItinerary.map(d =>
                              d.id === day.id
                                ? { ...d, activities: d.activities.filter(a => a.id !== activity.id) }
                                : d
                            );
                            setItinerary(newItinerary);
                          }}
                          onEdit={(updatedActivity) => {
                            const newItinerary = normalizedItinerary.map(d =>
                              d.id === day.id
                                ? {
                                    ...d,
                                    activities: d.activities.map(a =>
                                      a.id === activity.id ? updatedActivity : a
                                    ),
                                  }
                                : d
                            );
                            setItinerary(newItinerary);
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <button
                    onClick={() => handleAddActivity(day.id)}
                    className="mt-6 text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {/* Show Kiwi.com ad after every 3rd day */}
                {(index + 1) % 3 === 0 && index !== normalizedItinerary.length - 1 && (
                  <div className="relative my-12 pointer-events-none">
                    <KiwiAdPanel />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <DragOverlay>
          {activeActivity ? (
            <div className="opacity-80">
              <ActivityCard
                activity={activeActivity}
                onDelete={() => {}}
                onEdit={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}