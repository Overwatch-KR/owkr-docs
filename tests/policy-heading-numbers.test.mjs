import test from 'node:test';
import assert from 'node:assert/strict';
import { markdownToHtml } from 'satteri';
import { policyHeadingNumbers } from '../src/lib/policy-heading-numbers.ts';

const render = (source, file = 'privacy') => markdownToHtml(source, {
    fileURL: new URL(`file:///repo/src/content/docs/gather-bot/${file}.md`),
    hastPlugins: [policyHeadingNumbers()],
}).html;

test('numbers policy headings once, resets per document, and preserves original slugs', () => {
    assert.match(render('## 운영자\n\n## 운영자'), /id="운영자"[^>]*><span[^>]*>01\. <\/span>운영자/);
    assert.match(render('## 운영자\n\n## 운영자'), /id="운영자-1"[^>]*><span[^>]*>02\. <\/span>운영자/);
    assert.match(render('## 1. 목적', 'terms'), /id="1-목적"[^>]*><span[^>]*>01\. <\/span>목적/);
    assert.match(render('## 문의', 'support'), />01\. <\/span>문의/);
});

test('leaves historical and non-policy headings untouched', () => {
    assert.equal(render('## 원문', 'index').trim(), '<h2>원문</h2>');
    assert.equal(markdownToHtml('## 이전 원문', {
        fileURL: new URL('file:///repo/src/content/policy-revisions/privacy-initial.md'),
        hastPlugins: [policyHeadingNumbers()],
    }).html.trim(), '<h2>이전 원문</h2>');
});
