import { addMonths, format, parse, isValid } from 'date-fns';

export function formatLocation(location: string): string {
  return location
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeLocation(location: string): string {
  // Remove extra spaces and normalize case
  return location.trim().replace(/\s+/g, ' ');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';

  // Try parsing common date formats
  const formats = [
    'MMM yyyy',
    'MMMM yyyy',
    'MMM',
    'MMMM',
    'MM/yyyy',
    'MM-yyyy',
    'yyyy-MM',
  ];

  for (const fmt of formats) {
    const parsed = parse(dateStr, fmt, new Date());
    if (isValid(parsed)) {
      // If only month is provided, use next occurrence of that month
      if (!dateStr.includes(parsed.getFullYear().toString())) {
        const now = new Date();
        const targetMonth = parsed.getMonth();
        let targetDate = new Date(now.getFullYear(), targetMonth, 1);
        
        // If the month has already passed this year, use next year
        if (targetDate < now) {
          targetDate = addMonths(targetDate, 12);
        }
        
        return format(targetDate, 'MMMM yyyy');
      }
      
      return format(parsed, 'MMMM yyyy');
    }
  }

  // If no valid date format is found, return as is
  return dateStr;
}