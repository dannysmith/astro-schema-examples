// External constants to test if Astro can resolve imported values in schemas

export const ARTICLE_STATUSES = ['draft', 'published', 'archived'] as const;

export const DEFAULT_AUTHOR = 'System';

export const CATEGORIES = [
  'technology',
  'design',
  'business',
  'lifestyle'
] as const;
