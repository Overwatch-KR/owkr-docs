import test from 'node:test';
import assert from 'node:assert/strict';
import { diffPolicyLines, policyDiffContext } from '../src/lib/policy-diff.ts';

test('both original versions can be reconstructed, including repeated and empty lines', () => {
    for (const [before, after] of [
        ['', '최초 공개'], ['삭제', ''], ['가\n가\n나', '가\n나\n나'],
        ['시작\n\n이전\n끝', '시작\n\n새 정책\n끝'], ['<script>', '<img>'],
        ['동일', '동일'],
    ]) {
        const diff = diffPolicyLines(before, after);
        assert.equal(diff.filter(line => line.kind !== 'added').map(line => line.text).join('\n'), before);
        assert.equal(diff.filter(line => line.kind !== 'removed').map(line => line.text).join('\n'), after);
        assert.deepEqual(diff.filter(line => line.before !== null).map(line => line.before), Array.from({ length: before ? before.split('\n').length : 0 }, (_, i) => i + 1));
        assert.deepEqual(diff.filter(line => line.after !== null).map(line => line.after), Array.from({ length: after ? after.split('\n').length : 0 }, (_, i) => i + 1));
    }
});

test('long unchanged sections collapse while adjacent changes keep context', () => {
    const before = Array.from({ length: 40 }, (_, i) => `항목 ${i}`);
    const after = [...before];
    after[20] = '변경된 항목';
    const context = policyDiffContext(diffPolicyLines(before.join('\n'), after.join('\n')));
    assert.equal(context.filter(line => line === null).length, 2);
    assert.deepEqual(context.filter(line => line?.kind === 'removed').map(line => line.text), ['항목 20']);
    assert.deepEqual(context.filter(line => line?.kind === 'added').map(line => line.text), ['변경된 항목']);
    assert.ok(context.filter(Boolean).length < 10);
});

test('line ending style alone does not create changes', () => {
    assert.ok(diffPolicyLines('가\r\n나\r\n', '가\n나\n').every(line => line.kind === 'context'));
});
