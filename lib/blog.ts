import slugify from 'slugify';
import type { BlogStatus } from './models/Blog';

/**
 * Public visibility filter.
 * A blog is public only when status === 'published'. Legacy records created
 * before the workflow existed have no `status` field — treat those as published
 * so nothing that was already live disappears. Everything else (draft, pending,
 * rejected, archived) is hidden from the site, sitemap, related lists and feeds.
 */
export const PUBLIC_BLOG_FILTER: Record<string, unknown> = {
  $or: [{ status: 'published' }, { status: { $exists: false } }],
};

export function isPublicStatus(status: BlogStatus | undefined | null): boolean {
  return status === 'published' || status == null;
}

/** Allowed workflow transitions (server-enforced — never trust the client). */
export const BLOG_TRANSITIONS: Record<BlogStatus, BlogStatus[]> = {
  draft: ['pending', 'published', 'archived'],
  pending: ['published', 'rejected', 'draft', 'archived'],
  published: ['archived', 'draft'], // unpublish -> archived; pull back to draft
  rejected: ['draft', 'pending', 'archived'],
  archived: ['draft', 'published'], // re-publish an archived post
};

export function canTransition(from: BlogStatus, to: BlogStatus): boolean {
  if (from === to) return true;
  return (BLOG_TRANSITIONS[from] || []).includes(to);
}

/**
 * Produce a clean, SEO-friendly, stable slug:
 * lowercase, hyphen-separated, ascii, no special characters.
 */
export function sanitizeSlug(input: string): string {
  return slugify(String(input || ''), {
    lower: true,
    strict: true, // strip characters that aren't url-safe
    trim: true,
    locale: 'en',
  }).slice(0, 96);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 96;
}

/** Strip HTML tags to estimate real, readable content length. */
export function textContentLength(html: string): number {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

export interface SeoCheckInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  image?: string;
  featuredImageAlt?: string;
  category?: string;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
}

export interface SeoCheckResult {
  level: 'ready' | 'warning' | 'error';
  errors: string[]; // block publishing
  warnings: string[]; // non-blocking recommendations
  passed: string[];
}

/**
 * Shared SEO/quality checklist used by both the admin preview and the publish
 * API. `errors` are hard blockers (publishing is rejected server-side); the
 * `warnings` are recommendations only — never a guarantee of ranking.
 */
export function runSeoChecklist(b: SeoCheckInput): SeoCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const passed: string[] = [];

  // ---- hard requirements (block publishing) ----
  if (!b.title || !b.title.trim()) errors.push('Title is required.');
  else passed.push('Title present');

  if (!b.slug || !isValidSlug(b.slug)) errors.push('A valid, lowercase, hyphenated slug is required.');
  else passed.push('Valid slug');

  const contentLen = textContentLength(b.content || '');
  if (contentLen < 300) errors.push('Content is too thin (aim for real, useful content, not a stub).');
  else passed.push('Content has substance');

  if (!b.image || !b.image.trim()) errors.push('A featured image is required.');
  else passed.push('Featured image present');

  if (b.canonicalUrl && b.canonicalUrl.trim()) {
    try {
      const u = new URL(b.canonicalUrl);
      if (u.protocol !== 'https:') warnings.push('Canonical URL should use HTTPS.');
      else passed.push('Canonical URL valid');
    } catch {
      errors.push('Canonical URL is not a valid URL.');
    }
  }

  // ---- recommendations (warnings only) ----
  if (!b.excerpt || !b.excerpt.trim()) warnings.push('Add an excerpt (used for listing + meta description fallback).');
  if (!b.featuredImageAlt || !b.featuredImageAlt.trim()) warnings.push('Add descriptive ALT text for the featured image.');
  else passed.push('Image ALT present');

  if (!b.author || !b.author.trim()) warnings.push('Add an author for trust/E-E-A-T (recommended for financial content).');
  else passed.push('Author present');

  if (!b.category || !b.category.trim()) warnings.push('Assign a category.');

  const seoTitle = (b.seoTitle || b.title || '').trim();
  if (!b.seoTitle || !b.seoTitle.trim()) warnings.push('Add an SEO title (falls back to the blog title).');
  else passed.push('SEO title present');
  if (seoTitle && (seoTitle.length < 15 || seoTitle.length > 60)) {
    warnings.push(`SEO title is ${seoTitle.length} chars — aim for ~50-60.`);
  }

  const seoDesc = (b.seoDescription || b.excerpt || '').trim();
  if (!b.seoDescription || !b.seoDescription.trim()) warnings.push('Add an SEO description (falls back to the excerpt).');
  else passed.push('SEO description present');
  if (seoDesc && (seoDesc.length < 70 || seoDesc.length > 160)) {
    warnings.push(`SEO description is ${seoDesc.length} chars — aim for ~120-155.`);
  }

  if (!b.focusKeyword || !b.focusKeyword.trim()) warnings.push('Add a focus keyword (search intent this post targets).');
  else passed.push('Focus keyword present');

  const level: SeoCheckResult['level'] = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'ready';
  return { level, errors, warnings, passed };
}
