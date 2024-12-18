import { format, addHours, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function parseMongoDate(data: any): Date {
  if (!data) return new Date();
  
  try {
    // Handle MongoDB date format
    if (data.$date) {
    return new Date(data.$date);
    }
  
    // Handle string input
    if (typeof data === 'string') {
    return new Date(data);
    }
  
    // If it's already a Date object
    if (data instanceof Date) {
    return data;
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
  
  return new Date();
}

export function formatToGMT3(date: string | Date): string {
  try {
    const dateObj = date instanceof Date ? date : parseMongoDate(date);
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid date';
    }
    const gmt3Date = addHours(dateObj, -3); // Convert to GMT-3
    return format(gmt3Date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function calculateDurationInMinutes(startTime: string | Date, finishTime: string | Date): number {
  try {
    const start = parseMongoDate(startTime);
    const finish = parseMongoDate(finishTime);
    return differenceInMinutes(finish, start);
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
}