import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnswerWriter } from '../src/lib/answer-writer.ts';

function setup(texts) {
    const tasks = new Map();
    let nextId = 0;
    let completed = 0;
    const output = [...texts];
    const writer = createAnswerWriter(texts.map((text, index) => ({ text, write: value => { output[index] = value; } })), {
        schedule: callback => { tasks.set(++nextId, callback); return nextId; },
        unschedule: id => tasks.delete(id),
        onComplete: () => { completed += 1; },
    });
    const tick = () => {
        const next = tasks.entries().next().value;
        if (next) { tasks.delete(next[0]); next[1](); }
    };
    return { writer, output, tick, tasks, get completed() { return completed; } };
}

test('streams separate formatted text nodes in order without splitting graphemes', () => {
    const state = setup(['한👨‍👩‍👧‍👦', ' 링크']);
    assert.deepEqual(state.output, ['', '']);
    state.tick();
    assert.deepEqual(state.output, ['한', '']);
    state.tick();
    assert.deepEqual(state.output, ['한👨‍👩‍👧‍👦', '']);
    while (state.tasks.size) state.tick();
    assert.deepEqual(state.output, ['한👨‍👩‍👧‍👦', ' 링크']);
    assert.equal(state.completed, 1);
});

test('reset cancels future writes and completion callbacks', () => {
    const state = setup(['이전 답변']);
    state.tick();
    const previous = [...state.output];
    state.writer.cancel();
    state.writer.complete();
    state.tick();
    assert.deepEqual(state.output, previous);
    assert.equal(state.tasks.size, 0);
    assert.equal(state.completed, 0);
});

test('skip or closing completes the original text exactly once and clears the timer', () => {
    const state = setup(['굵은 글씨', '와 링크']);
    state.tick();
    state.writer.complete();
    state.writer.complete();
    assert.deepEqual(state.output, ['굵은 글씨', '와 링크']);
    assert.equal(state.tasks.size, 0);
    assert.equal(state.completed, 1);
});
