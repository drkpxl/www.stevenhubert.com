import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    agency: z.string().optional(),
    role: z.string().optional(),
    tier: z.enum(['1', '2']),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    heroImage: z.string().optional(),
    excerpt: z.string(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    awards: z.array(z.string()).optional(),
    externalUrl: z.string().url().optional(),
    sourceDate: z.coerce.date().optional(),
  }),
});

export const collections = { work };
