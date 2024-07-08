import { format, formatDistance, formatDistanceToNow, getTime } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import moment from 'moment';

// ----------------------------------------------------------------------
export function fMonth(date) {
  return format(new Date(date), 'MMMM yyyy');
}

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm');
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fDistance(date) {
  const duration = moment.duration(moment().diff(date));
  // console.log(formatDistance(new Date(), new Date(date), duration))
  return {
    string: formatDistance(new Date(date), new Date(),
      {
        addSuffix: true,
        locale: enUS
      }),
    duration,
    isFutureDay: duration._data.days < 0,
    isToday: duration._data.days === 0,
  }
}

export function fToNow(date, currentLang) {
  return formatDistanceToNow(
    new Date(date),
    { locale: currentLang === 'en' ? enUS : vi },
    {
      addSuffix: true,
    }
  );
}

export function fDateOfWeek(date) {
  return format(new Date(date), 'EEEE');
}

export function getDateDistanceOfWeek(start, end) {
  const duration = moment.duration(moment(end).diff(start));
  if (duration._data.hours < 12 && duration._data.days < 1) {
    // return fDateOfWeek(start)
    return `${moment(start).format('dddd')}`
  }
  return `${fDateOfWeek(start)} to ${fDateOfWeek(end)}`
}

export function getTimeDistance(start, end) {
  const duration = moment.duration(moment(end).diff(start));
  if (duration._data.hours < 12 && duration._data.days < 1) {
    return `${moment(start).format('LT')} to ${moment(end).format('LT')}`
  }
  return `${moment(start).format('lll')} to ${moment(end).format('lll')}`
}
