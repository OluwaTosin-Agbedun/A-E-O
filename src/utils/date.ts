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

export function parseDateValue(dateVal: any): number {
  if (!dateVal) return 0;

  if (dateVal instanceof Date) {
    return dateVal.getTime();
  }

  if (typeof dateVal === 'object') {
    if (typeof dateVal.seconds === 'number') {
      return dateVal.seconds * 1000;
    }
    if (typeof dateVal.toDate === 'function') {
      try {
        return dateVal.toDate().getTime();
      } catch (e) {}
    }
  }

  let str = String(dateVal).trim();
  if (!str) return 0;

  // Standardize unicode dashes & slashes
  str = str.replace(/[–—]/g, '-');

  // Direct ISO/standard parse
  const directTimestamp = Date.parse(str);
  if (!isNaN(directTimestamp) && !/^\d{4}$/.test(str) && !str.includes('-')) {
    return directTimestamp;
  }

  // Handle day ranges like "18-20 Sep 2026" or "09-10 Oct 2026" -> take "18 Sep 2026"
  const dayRangeMatch = str.match(/^(\d{1,2})\s*-\s*\d{1,2}\s+([a-zA-Z]+\s+\d{4})$/);
  if (dayRangeMatch) {
    str = `${dayRangeMatch[1]} ${dayRangeMatch[2]}`;
  }

  // Handle slash range like "Late 2027 / Early 2028" -> take "Late 2027"
  if (str.includes('/')) {
    const firstPart = str.split('/')[0].trim();
    if (firstPart) str = firstPart;
  }

  // Handle Quarters: "Q1 2026", "Q3 2026"
  const qMatch = str.match(/^Q([1-4])\s+(\d{4})$/i);
  if (qMatch) {
    const q = parseInt(qMatch[1], 10);
    const yr = qMatch[2];
    const month = (q - 1) * 3 + 1;
    str = `1 ${month} ${yr}`;
  }

  // Handle relative time indicators: Mid-2027, Late 2027, Early 2027, Mid-to-Late 2027
  if (/^early\b/i.test(str)) {
    const yr = str.match(/\d{4}/)?.[0] || '2026';
    str = `1 Jan ${yr}`;
  } else if (/^mid-to-late\b/i.test(str)) {
    const yr = str.match(/\d{4}/)?.[0] || '2026';
    str = `1 Sep ${yr}`;
  } else if (/^mid\b/i.test(str)) {
    const yr = str.match(/\d{4}/)?.[0] || '2026';
    str = `1 Jun ${yr}`;
  } else if (/^late\b/i.test(str)) {
    const yr = str.match(/\d{4}/)?.[0] || '2026';
    str = `1 Nov ${yr}`;
  }

  // Handle year range like "2026-2027"
  const yrRange = str.match(/^(\d{4})\s*-\s*\d{4}$/);
  if (yrRange) {
    str = `1 Jan ${yrRange[1]}`;
  }

  // Handle Month + Year like "August 2026", "Aug 2026"
  const monthYr = str.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (monthYr) {
    str = `1 ${monthYr[1]} ${monthYr[2]}`;
  }

  // Handle pure year e.g. "2026"
  if (/^\d{4}$/.test(str)) {
    str = `1 Jan ${str}`;
  }

  // Handle Day Month Year e.g. "17 Aug 2026", "08 Nov 2025"
  const dmy = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (dmy) {
    const t = Date.parse(`${dmy[1]} ${dmy[2]} ${dmy[3]}`);
    if (!isNaN(t)) return t;
  }

  const finalParsed = Date.parse(str);
  return isNaN(finalParsed) ? 0 : finalParsed;
}

export function sortItemsByDate<T>(
  items: T[], 
  dateField: keyof T | string = 'date', 
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a: any, b: any) => {
    const tA = parseDateValue(a?.[dateField]);
    const tB = parseDateValue(b?.[dateField]);
    if (tA === tB) return 0;
    return direction === 'asc' ? tA - tB : tB - tA;
  });
}
