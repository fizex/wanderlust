import { Activity, ItineraryDay } from "../../types/itinerary";

export interface RoutingPlanDay {
  main_city: string;
  suggested_accommodation: string;
  travel_from_previous: string | null;
  weather_info?: {
    temperature?: string;
    conditions?: string[];
  };
  local_events?: Array<{
    event_name: string;
    event_description?: string;
  }>;
}

export interface RoutingPlan {
  days: RoutingPlanDay[];
  country: string;
  startLocation: string;
  totalDays: number;
  recommendedSeasons?: string[];
  timeZone?: string;
  currency?: string;
  languages?: string[];
}

export interface DayActivities {
  activities: Activity[];
}

export function validateRoutingPlan(data: unknown): data is RoutingPlan {
  if (!data || typeof data !== 'object') return false;
  
  const plan = data as RoutingPlan;
  
  if (!Array.isArray(plan.days)) return false;
  if (typeof plan.country !== 'string') return false;
  if (typeof plan.startLocation !== 'string') return false;
  if (typeof plan.totalDays !== 'number') return false;
  
  return plan.days.every(day => validateRoutingDay(day));
}

export function validateRoutingDay(day: unknown): day is RoutingPlanDay {
  if (!day || typeof day !== 'object') return false;
  
  const routingDay = day as RoutingPlanDay;
  
  return (
    typeof routingDay.main_city === 'string' &&
    typeof routingDay.suggested_accommodation === 'string' &&
    (routingDay.travel_from_previous === null || typeof routingDay.travel_from_previous === 'string')
  );
}

export function validateDayActivities(data: unknown): data is DayActivities {
  if (!data || typeof data !== 'object') return false;
  
  const activities = data as DayActivities;
  
  if (!Array.isArray(activities.activities)) return false;
  
  return activities.activities.every(activity => validateActivity(activity));
}

export function validateActivity(activity: unknown): activity is Activity {
  if (!activity || typeof activity !== 'object') return false;
  
  const act = activity as Activity;
  
  return (
    typeof act.title === 'string' &&
    typeof act.description === 'string' &&
    typeof act.type === 'string' &&
    ['dining', 'exploration', 'event', 'accommodation', 'custom'].includes(act.type)
  );
}