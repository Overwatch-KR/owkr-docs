import test from 'node:test';
import assert from 'node:assert/strict';
import { diffPolicyMarkdown } from '../src/lib/policy-markdown-diff.ts';
import { policyDiffContext } from '../src/lib/policy-diff.ts';

test('renders whole Markdown blocks with original source ranges', () => {
    const body = '## 제목\n\n**굵게**\n이어지는 문단\n\n- 하나\n- 둘\n\n| 항목 | 기간 |\n| --- | --- |\n| 로그 | 30일 |';
    const blocks = diffPolicyMarkdown('', body);
    assert.deepEqual(blocks.map((block) => block.after), ['1', '3–4', '6–7', '9–11']);
    assert.ok(blocks.every((block) => block.kind === 'added' && block.before === null));
    assert.match(blocks[0].html, /<h2>제목<\/h2>/);
    assert.match(blocks[1].html, /<strong>굵게<\/strong>/);
    assert.match(blocks[2].html, /<ul>[\s\S]*<li>둘<\/li>/);
    assert.match(blocks[3].html, /<table>[\s\S]*<td>30일<\/td>/);
});

test('keeps unchanged blocks and notices reference link target changes', () => {
    const before = '[안내][policy]\n\n[policy]: https://example.com/old';
    const after = '[안내][policy]\n\n[policy]: https://example.com/new';
    const diff = diffPolicyMarkdown(before, after);
    assert.deepEqual(diff.map((block) => block.kind), ['removed', 'added']);
    assert.match(diff[1].html, /href="https:\/\/example.com\/new"/);
    assert.deepEqual(policyDiffContext(diffPolicyMarkdown(before, before)), [null]);
});

test('escapes raw HTML, excludes active URLs and does not load historical images', () => {
    const html = diffPolicyMarkdown('', '<script>alert(1)</script>\n\n[x](javascript:alert)\n\n![설명](https://example.com/image.png)').map((block) => block.html).join('');
    assert.doesNotMatch(html, /<script|href="javascript:|<img/);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /설명/);
});

test('preserves removed block locations and handles CRLF consistently', () => {
    const diff = diffPolicyMarkdown('## 제목\r\n\r\n이전', '## 제목\n\n이후');
    assert.deepEqual(diff.map(({ kind, before, after }) => ({ kind, before, after })), [
        { kind: 'context', before: '1', after: '1' },
        { kind: 'removed', before: '3', after: null },
        { kind: 'added', before: null, after: '3' },
    ]);
});
