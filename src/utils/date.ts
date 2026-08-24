export function formatReportDate(dateStr: any): string {
  if (!dateStr) return '';
  
  const origStr = String(dateStr).trim().toLowerCase();
  
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  }

  const t = parseDateValue(dateStr);
  if (t > 0) {
     const d = new Date(t);
     // Check if original string was incomplete (like Q3, or Aug 2026, or year range)
     if (/^q[1-4]|mid|late|early|-|\/|–/.test(origStr) || /^[a-z]+\s+\d{4}$/.test(origStr) || /^\d{4}$/.test(origStr)) {
       return "Date Pending (CMS Update Required)"; // Identify for correction as per instructions
     }
     
     const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
     return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  return "Date Pending (CMS Update Required)";
}

export function parseDateValue(dateVal: any): number {
  if (!dateVal) return 0;

  if (typeof dateVal === 'number') {
    if (!isNaN(dateVal) && dateVal > 0) return dateVal;
    return 0;
  }

  if (dateVal instanceof Date) {
    const t = dateVal.getTime();
    return isNaN(t) ? 0 : t;
  }

  if (typeof dateVal === 'object') {
    if (typeof dateVal.seconds === 'number') {
      return dateVal.seconds * 1000;
    }
    if (typeof dateVal.toDate === 'function') {
      try {
        const d = dateVal.toDate();
        if (d instanceof Date) return d.getTime();
      } catch (e) {}
    }
    if (dateVal.seconds) return Number(dateVal.seconds) * 1000;
  }

  let str = String(dateVal).trim();
  if (!str) return 0;

  // Numeric timestamp string e.g. "1786924800000"
  if (/^\d{11,14}$/.test(str)) {
    const num = Number(str);
    if (!isNaN(num)) return num;
  }

  // Handle metadata splits if present
  if (str.includes('·')) {
    str = str.split('·')[0].trim();
  }
  if (str.includes('|')) {
    str = str.split('|')[0].trim();
  }

  // Standardize unicode dashes & slashes
  str = str.replace(/[–—]/g, '-');

  // Strip leading day-of-week names e.g. "Saturday, 15 August 2026"
  str = str.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\s]+/i, '');

  // Strip ordinal suffixes from days: "17th" -> "17", "1st" -> "1", "2nd" -> "2", "3rd" -> "3", "6TH" -> "6"
  str = str.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1');

  // Remove commas between day, month, year e.g. "10 August, 2026" -> "10 August 2026", "April, 2026" -> "April 2026"
  str = str.replace(/(\d{1,2}|[a-zA-Z]+),\s*(\d{4})/g, '$1 $2');
  str = str.replace(/([a-zA-Z]+),\s*(\d{1,2})/g, '$1 $2');

  // Direct ISO / standard parse check
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

  // Handle Month + Year like "August 2026", "Aug 2026", "April 2026"
  const monthYr = str.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (monthYr) {
    str = `1 ${monthYr[1]} ${monthYr[2]}`;
  }

  // Handle pure year e.g. "2024", "2025", "2026"
  if (/^\d{4}$/.test(str)) {
    str = `1 Jan ${str}`;
  }

  // Handle Day Month Year e.g. "17 Aug 2026", "17 August 2026", "08 Nov 2025", "6 October 2025"
  const dmy = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (dmy) {
    const t = Date.parse(`${dmy[1]} ${dmy[2]} ${dmy[3]}`);
    if (!isNaN(t)) return t;
  }

  const finalParsed = Date.parse(str);
  return isNaN(finalParsed) ? 0 : finalParsed;
}

export function getPublicationTimestamp(item: any): number {
  if (!item) return 0;

  // Direct date string, number, or Date instance
  if (
    typeof item === 'string' || 
    typeof item === 'number' || 
    item instanceof Date
  ) {
    return parseDateValue(item);
  }

  if (typeof item === 'object') {
    // If it's a timestamp object directly
    if (typeof item.seconds === 'number' || typeof item.toDate === 'function') {
      return parseDateValue(item);
    }

    // Unwrap if wrapper object (like originalItem in unified publication structures)
    const target = item.originalItem || item;

    // Check fields in specified priority: publicationDate -> publishedAt -> date -> createdAt
    const primaryVal = target.publicationDate || target.publishedAt || target.date;
    if (primaryVal) {
      const ts = parseDateValue(primaryVal);
      if (ts > 0) return ts;
    }

    // Check item's wrapper date if target didn't yield a valid timestamp
    if (item.date && item.date !== primaryVal) {
      const ts = parseDateValue(item.date);
      if (ts > 0) return ts;
    }

    // Fallback to createdAt if no genuine publication date exists
    if (target.createdAt || item.createdAt) {
      const ts = parseDateValue(target.createdAt || item.createdAt);
      if (ts > 0) return ts;
    }
  }

  return 0;
}

export function sortItemsByDate<T>(
  items: T[], 
  dateField?: keyof T | string, 
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a: any, b: any) => {
    let tA = 0;
    let tB = 0;

    if (dateField && typeof dateField === 'string' && dateField !== 'date') {
      tA = (a && a[dateField] ? parseDateValue(a[dateField]) : 0) || getPublicationTimestamp(a);
      tB = (b && b[dateField] ? parseDateValue(b[dateField]) : 0) || getPublicationTimestamp(b);
    } else {
      tA = getPublicationTimestamp(a);
      tB = getPublicationTimestamp(b);
    }

    if (tA !== tB) {
      return direction === 'desc' ? tB - tA : tA - tB;
    }

    // Secondary tie-breaker: createdAt (chronological fallback)
    const cA = parseDateValue(a?.originalItem?.createdAt || a?.createdAt);
    const cB = parseDateValue(b?.originalItem?.createdAt || b?.createdAt);
    if (cA !== cB) {
      return direction === 'desc' ? cB - cA : cA - cB;
    }

    // Tertiary tie-breaker: title
    const titleA = a?.title || a?.name || '';
    const titleB = b?.title || b?.name || '';
    return titleA.localeCompare(titleB);
  });
}
