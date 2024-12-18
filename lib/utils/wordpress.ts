export function sanitizeWordPressContent(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, (match) => {
      const entities: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&ndash;': '–',
        '&mdash;': '—',
        '&nbsp;': ' ',
        '&copy;': '©',
        '&reg;': '®',
        '&trade;': '™'
      };
      return entities[match] || match;
    })
    .trim();
}