export function formatReportDate(dateStr: any): string {
  if (!dateStr) return '';
  
  let str = '';
  if (typeof dateStr === 'string') {
    str = dateStr;
  } else if (dateStr instanceof Date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${dateStr.getDate()} ${months[dateStr.getMonth()]} ${dateStr.getFullYear()}`;
  } else if (typeof dateStr === 'object') {
    if (typeof dateStr.seconds === 'number') {
      const d = new Date(dateStr.seconds * 1000);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    if (typeof dateStr.toDate === 'function') {
      try {
        const d = dateStr.toDate();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch (e) {}
    }
    str = String(dateStr);
  } else {
    str = String(dateStr);
  }

  const monthMap: Record<string, string> = {
    jan: 'January', january: 'January',
    feb: 'February', february: 'February',
    mar: 'March', march: 'March',
    apr: 'April', april: 'April',
    may: 'May',
    jun: 'June', june: 'June',
    jul: 'July', july: 'July',
    aug: 'August', august: 'August',
    sep: 'September', september: 'September',
    oct: 'October', october: 'October',
    nov: 'November', november: 'November',
    dec: 'December', december: 'December'
  };

  const cleanStr = str.trim().replace(/\s+/g, ' ');
  
  // Pattern 1: "9 Feb 2026" or "09 Feb 2026" or "12 January, 2026"
  const dayMonthYearRegex = /^(\d{1,2})[\s,]+([a-zA-Z]+)[\s,]+(\d{4})$/;
  const matchDmy = cleanStr.match(dayMonthYearRegex);
  if (matchDmy) {
    const day = parseInt(matchDmy[1], 10);
    const monthKey = matchDmy[2].toLowerCase().replace(/[^a-z]/g, '');
    const year = matchDmy[3];
    const fullMonth = monthMap[monthKey] || matchDmy[2];
    return `${day} ${fullMonth}, ${year}`;
  }

  // Pattern 2: "Feb 2026" or "February 2026" or "Feb, 2026"
  const monthYearRegex = /^([a-zA-Z]+)[\s,]+(\d{4})$/;
  const matchMy = cleanStr.match(monthYearRegex);
  if (matchMy) {
    const monthKey = matchMy[1].toLowerCase().replace(/[^a-z]/g, '');
    const year = matchMy[2];
    const fullMonth = monthMap[monthKey] || matchMy[1];
    return `${fullMonth}, ${year}`;
  }

  // General replacement fallback
  let formatted = str;
  Object.entries(monthMap).forEach(([abbr, full]) => {
    if (abbr.length === 3) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      formatted = formatted.replace(regex, full);
    }
  });
  return formatted;
}
