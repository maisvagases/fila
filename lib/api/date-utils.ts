import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { API_CONFIG } from '@/lib/config';

export function formatDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : utcToZonedTime(dateInput, API_CONFIG.TIME_ZONE);
  return format(date, "dd/MM/yyyy 'às' HH:mm");
}