// utils/dateUtils.ts
import { format, isToday, isYesterday, differenceInCalendarDays } from 'date-fns';
import { Message } from 'src/types/chat';

export function formatDayDivider(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  const diff = differenceInCalendarDays(new Date(), date);
  if (diff < 7) {
    return format(date, 'EEEE');
  }

  return format(date, 'dd MMMM yyyy');
}

export function insertDateDividers(messages: Message[]): Message[] {
  if (!messages.length) return [];

  let lastDateKey = '';

  return messages.flatMap((msg) => {
    const msgDate = msg.createdAt ? new Date(msg.createdAt) : null;
    const dateKey = msgDate ? format(msgDate, 'yyyy-MM-dd') : '';

    const result: Message[] = [];

    if (dateKey !== lastDateKey) {
      result.push({
        type: 'divider',
        text: msgDate ? formatDayDivider(msgDate) : '',
        createdAt: msg.createdAt,
      });
      lastDateKey = dateKey;
    }

    result.push(msg);
    return result;
  });
}

