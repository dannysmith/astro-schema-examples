import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { ARTICLE_STATUSES, DEFAULT_AUTHOR, CATEGORIES } from './constants';

// Test 1: Local constants in enums
const LOCAL_PRIORITIES = ['low', 'medium', 'high'] as const;

// Test 3: Reusable schema fragments
const seoSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(15).max(160),
});

// Single collection to test all patterns
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    // Test 1: Local constant in enum
    priority: z.enum(LOCAL_PRIORITIES),

    // Test 2: Imported constant in enum
    status: z.enum(ARTICLE_STATUSES),

    // Test 2b: Imported constant in union
    category: z.enum(CATEGORIES),

    // Test 3: Reusable schema via merge
    seo: seoSchema,

    // Test 4: Computed/derived default value
    author: z.string().default(DEFAULT_AUTHOR),

    // Test 5: Descriptions on fields
    title: z.string().describe('The main title of the article'),
    content: z.string().describe('The full article content in markdown'),
    publishDate: z.date().describe('When this article was first published'),

    // Test 6: Custom refinements/validations
    tags: z.array(z.string())
      .min(1, 'At least one tag is required')
      .refine(
        (tags) => tags.every(tag => tag.length >= 2),
        'All tags must be at least 2 characters long'
      ),
  }),
});

export const collections = { articles };
