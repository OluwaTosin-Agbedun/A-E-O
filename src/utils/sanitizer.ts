import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML string using DOMPurify to eliminate XSS risks like <script> or onclick handlers,
 * while allowing safe publishing formatting tags and attributes.
 */
export function sanitizeHtml(htmlString: string): string {
  if (!htmlString) return '';
  
  return DOMPurify.sanitize(htmlString, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
      'ul', 'ol', 'li', 
      'blockquote', 'a', 'span', 'div', 'br', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'align', 'id', 'title'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
  });
}

/**
 * Checks if a string contains HTML markup tags.
 */
export function isHtmlContent(text: string): boolean {
  if (!text) return false;
  return /<\/?[a-z][\s\S]*>/i.test(text);
}
