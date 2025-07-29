
import { format, isToday, isTomorrow, formatRelative } from 'date-fns';
import { ko } from 'date-fns/locale';

export const getRelativeDate = (date: Date): string => {
  if (isToday(date)) {
    return '오늘';
  }
  if (isTomorrow(date)) {
    return '내일';
  }
  return format(date, 'MMM d일 (EEE)', { locale: ko });
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (dateString?: string): string | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const relativeDate = getRelativeDate(date);
  const time = formatTime(date);

  return `${relativeDate} ${time}`;
};

export const formatDateInfo = (
  dueDate?: string,
  dateRange?: { start: string; end: string },
  repeatSettings?: { frequency: string; weekdays?: any }
): string | null => {
  if (dueDate) {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return null;
    
    const relativeDate = getRelativeDate(date);
    const time = formatTime(date);
    
    return `${relativeDate} ${time}`;
  }
  if (dateRange?.start && dateRange?.end) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    
    const formattedStart = format(start, 'MMM d일', { locale: ko });
    const formattedEnd = format(end, 'MMM d일', { locale: ko });
    return `${formattedStart} - ${formattedEnd}`;
  }
  if (repeatSettings) {
    const { frequency, weekdays } = repeatSettings;
    if (frequency === 'weekly') {
      const days = { sunday: '일', monday: '월', tuesday: '화', wednesday: '수', thursday: '목', friday: '금', saturday: '토' };
      const selected = Object.keys(weekdays || {}).filter(key => weekdays[key]).map(key => days[key]).join(', ');
      return `매주 ${selected || '요일 없음'}`;
    }
    if (frequency === 'monthly') return '매월';
    if (frequency === 'yearly') return '매년';
  }
  return null;
};
