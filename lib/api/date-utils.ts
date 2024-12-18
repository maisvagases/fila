import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { API_CONFIG } from '@/lib/config';

export function formatDateTime(isoString: string): string {
  const date = utcToZonedTime(new Date(isoString), API_CONFIG.TIME_ZONE);
  return format(date, "dd/MM/yyyy HH:mm:ss");
}