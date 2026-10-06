import sanitizeHtml from 'sanitize-html';

// Server-only. Blog bodies are HTML written in the admin panel and rendered on
// the public site with dangerouslySetInnerHTML, so they are sanitised against an
// allowlist both when saved and when rendered: no <script>, event handlers,
// javascript: URLs, <iframe> (except YouTube embeds), <style> or forms.
// A compromised or careless staff account therefore can't plant stored XSS.

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'blockquote', 'pre', 'code',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'mark', 'small', 'span', 'div', 'a', 'img', 'figure', 'figcaption', 'picture', 'source',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'details', 'summary', 'iframe',
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'title', 'lang', 'dir'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding'],
    source: ['srcset', 'type', 'media', 'sizes'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    ol: ['start', 'type'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'loading'],
  },
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https', 'http', 'data'] },
  allowProtocolRelative: false,
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  // Drop an iframe whose src was rejected instead of leaving an empty frame.
  exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
  transformTags: {
    // The page title is the only H1; demote any H1 inside the body.
    h1: 'h2',
    // External links open safely and don't pass page authority by default.
    a: (tagName, attribs) => {
      const href = attribs.href || '';
      const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?ezyloan\.co\.in(\/|$)/i.test(href);
      if (external) {
        return { tagName, attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' } };
      }
      return { tagName, attribs };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { loading: 'lazy', decoding: 'async', ...attribs } }),
  },
};

export function sanitizeBlogHtml(html: unknown): string {
  return sanitizeHtml(String(html ?? ''), OPTIONS);
}

/** Short text fields (title, excerpt, alt…): strip any markup, cap the length.
 *  React escapes these on render; this just keeps stray HTML out of the data. */
export function plainText(v: unknown, max = 500): string {
  return String(v ?? '').replace(/<[^>]*>/g, '').trim().slice(0, max);
}
