
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

export function formatToGMT3(date: Date): string {
  return date.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateDurationInMinutes(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
}