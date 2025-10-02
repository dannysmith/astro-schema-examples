import { defineCollection, z, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Blog Collection - demonstrates string, date, boolean, number, enum, array variations
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
    // Strings with various configurations
    title: z.string(),
    subtitle: z.string().optional(),
    authorFallback: z.string().default("Anonymous"),
    contactEmail: z.string().email(),
    canonicalUrl: z.string().url(),
    description: z.string().min(10).max(200),

    // Dates
    publishDate: z.date(),
    updatedDate: z.date().optional(),

    // Booleans
    isDraft: z.boolean(),
    featured: z.boolean().default(false),

    // Numbers
    readingTime: z.number(),
    viewCount: z.number().int().positive().optional(),

    // Enum
    status: z.enum(["draft", "published", "archived"]),

    // Arrays
    tags: z.array(z.string()),
    categories: z.array(z.string()).min(1).max(5),

    // Reference to another collection
    primaryAuthor: reference('authors'),
  }),
});

// Authors Collection - demonstrates image(), nested objects, arrays of objects, records
const authors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/authors" }),
  schema: ({ image }) => z.object({
    name: z.string(),
    bio: z.string().min(50),
    email: z.string().email(),
    website: z.string().url().optional(),

    // Images
    avatar: image(),
    coverPhoto: image().optional(),

    // Nested object
    social: z.object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
    }),

    // Array of nested objects
    links: z.array(z.object({
      url: z.string().url(),
      title: z.string(),
      description: z.string().optional(),
    })),

    // Record (key-value pairs)
    metadata: z.record(z.string()),

    // Number with default
    postCount: z.number().int().min(0).default(0),
  }),
});

// Projects Collection - demonstrates advanced types: literal, union, tuple, transforms
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),

    // Literal value
    type: z.literal("project"),

    // Union types
    visibility: z.union([
      z.literal("public"),
      z.literal("private"),
      z.literal("internal"),
    ]),

    // Tuple (fixed-length array with specific types)
    coordinates: z.tuple([z.number(), z.number()]),

    // Array of references
    relatedPosts: z.array(reference('blog')),

    // Discriminated union
    deployment: z.discriminatedUnion('platform', [
      z.object({
        platform: z.literal('vercel'),
        projectId: z.string(),
      }),
      z.object({
        platform: z.literal('netlify'),
        siteId: z.string(),
      }),
      z.object({
        platform: z.literal('cloudflare'),
        accountId: z.string(),
      }),
    ]),

    // Date with coercion
    startDate: z.coerce.date(),

    // Transform (custom transformation)
    slug: z.string().transform((val) => val.toLowerCase().replace(/\s+/g, '-')),

    // Complex nested object
    config: z.object({
      build: z.object({
        command: z.string(),
        outputDir: z.string(),
      }),
      env: z.record(z.string()),
    }),
  }),
});

// Documentation Collection - using file() loader with JSON
const documentation = defineCollection({
  loader: file("src/content/documentation/docs.json"),
  schema: z.object({
    title: z.string(),
    section: z.string(),
    order: z.number(),

    // Nested object schema
    content: z.object({
      summary: z.string(),
      details: z.string(),
      examples: z.array(z.string()).optional(),
    }),

    // Using coerce.date() for JSON compatibility
    lastUpdated: z.coerce.date(),
  }),
});

export const collections = { blog, authors, projects, documentation };
