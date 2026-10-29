interface TextTarget {
    text: string;
    write: (text: string) => void;
}
interface WriterOptions {
    schedule: (callback: () => void, delay: number) => number;
    unschedule: (id: number) => void;
    onComplete: () => void;
    onProgress?: () => void;
}

/** @description 한글 결합 문자와 이모지를 나누지 않고 텍스트만 순서대로 표시한다. */
export function createAnswerWriter(targets: TextTarget[], options: WriterOptions) {
    const segmenter = typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter('ko', { granularity: 'grapheme' }) : null;
    const entries = targets.map((target) => ({
        ...target,
        characters: segmenter ? Array.from(segmenter.segment(target.text), (part) => part.segment) : Array.from(target.text),
    }));
    let timer: number | null = null;
    let stopped = false;
    let entryIndex = 0;
    let characterIndex = 0;
    entries.forEach((entry) => entry.write(''));

    const cancel = () => {
        if (timer !== null) options.unschedule(timer);
        timer = null;
        stopped = true;
    };
    const complete = () => {
        if (stopped) return;
        cancel();
        entries.forEach((entry) => entry.write(entry.text));
        options.onComplete();
    };
    const step = () => {
        if (stopped) return;
        timer = null;
        while (entries[entryIndex] && characterIndex >= entries[entryIndex].characters.length) {
            entryIndex += 1;
            characterIndex = 0;
        }
        const entry = entries[entryIndex];
        if (!entry) {
            complete();
            return;
        }
        characterIndex += 1;
        entry.write(entry.characters.slice(0, characterIndex).join(''));
        options.onProgress?.();
        timer = options.schedule(step, 18);
    };
    timer = options.schedule(step, 18);
    return { cancel, complete };
}
