export interface DiffLine {
    kind: 'context' | 'added' | 'removed';
    text: string;
    before: number | null;
    after: number | null;
}

const lines = (text: string): string[] => text === '' ? [] : text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');

/** @description 공개 문서 두 버전의 행 순서를 보존해 추가·삭제를 계산한다. */
export function diffPolicyLines(before: string, after: string): DiffLine[] {
    const oldLines = lines(before);
    const newLines = lines(after);
    const scores = Array.from({ length: oldLines.length + 1 }, () => new Uint32Array(newLines.length + 1));
    for (let i = oldLines.length - 1; i >= 0; i--) {
        for (let j = newLines.length - 1; j >= 0; j--) {
            scores[i][j] = oldLines[i] === newLines[j] ? scores[i + 1][j + 1] + 1 : Math.max(scores[i + 1][j], scores[i][j + 1]);
        }
    }
    const result: DiffLine[] = [];
    let i = 0;
    let j = 0;
    while (i < oldLines.length || j < newLines.length) {
        if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
            result.push({ kind: 'context', text: oldLines[i], before: ++i, after: ++j });
        } else if (i < oldLines.length && (j === newLines.length || scores[i + 1][j] >= scores[i][j + 1])) {
            result.push({ kind: 'removed', text: oldLines[i], before: ++i, after: null });
        } else {
            result.push({ kind: 'added', text: newLines[j], before: null, after: ++j });
        }
    }
    return result;
}

/** @description 변경 주변 문맥을 남기고 긴 동일 구간을 생략 표시로 묶는다. */
export function policyDiffContext<T extends { kind: DiffLine['kind'] }>(diff: T[], context = 2): (T | null)[] {
    const visible = new Set<number>();
    diff.forEach((line, index) => {
        if (line.kind === 'context') return;
        for (let item = Math.max(0, index - context); item <= Math.min(diff.length - 1, index + context); item++) visible.add(item);
    });
    const result: (T | null)[] = [];
    let skipped = false;
    diff.forEach((line, index) => {
        if (visible.has(index)) {
            result.push(line);
            skipped = false;
        } else if (!skipped) {
            result.push(null);
            skipped = true;
        }
    });
    return result;
}
