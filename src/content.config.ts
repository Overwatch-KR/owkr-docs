import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { FAQ_CATEGORIES } from './lib/faq';

const documentSchema = z.object({
    title: z.string(),
    description: z.string(),
    label: z.string(),
    version: z.string(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date(),
    changeSummary: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived']).default('active'),
    showSidebar: z.boolean().default(true),
});

const docs = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
    schema: documentSchema,
});

const faq = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
    schema: z.object({
        question: z.string(),
        category: z.enum(FAQ_CATEGORIES),
        order: z.number().int().positive(),
    }),
});

const policyRevisions = defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/policy-revisions' }),
    schema: z.object({
        document: z.enum(['terms', 'privacy', 'support']),
        publishedAt: z.coerce.date(),
        order: z.number().int().positive(),
        label: z.string(),
        status: z.enum(['draft', 'active']),
        summary: z.string(),
        sourceUrl: z.url(),
    }),
});

export const collections = { docs, faq, policyRevisions };
