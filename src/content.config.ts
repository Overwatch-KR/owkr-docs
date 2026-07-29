import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const documentSchema = z.object({
    title: z.string(),
    description: z.string(),
    label: z.string(),
    version: z.string(),
    updatedAt: z.coerce.date(),
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
        category: z.enum(['참가', '게임 진행', '커뮤니케이션', '경고와 제재']),
        order: z.number().int().positive(),
    }),
});

export const collections = { docs, faq };
