// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { policyHeadingNumbers } from './src/lib/policy-heading-numbers.ts';

export default defineConfig({
    site: 'https://overwatch-kr.github.io',
    base: '/owkr-docs',
    trailingSlash: 'never',
    markdown: { processor: satteri({ hastPlugins: [policyHeadingNumbers()] }) },
});
