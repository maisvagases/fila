import { format } from 'date-fns';
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

export function formatToGMT3(date: Date): string {
  return format(date, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
}

export function calculateDurationInMinutes(startTime: string | Date, endTime: string | Date): number {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  // Verifica se as datas são válidas
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid date provided:', { startTime, endTime });
    return 0; // Retorna 0 se as datas não forem válidas
  }

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}