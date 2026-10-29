import { markdownToHtml, markdownToMdast, type HastPluginDefinition } from 'satteri';
import { diffPolicyLines } from './policy-diff.ts';

interface MarkdownBlock {
    source: string;
    html: string;
    range: string;
}

export interface MarkdownDiffBlock {
    kind: 'context' | 'added' | 'removed';
    before: string | null;
    after: string | null;
    html: string;
}

const comparisonMarkup = {
    name: 'owkr-comparison-markup',
    raw(node, context) {
        context.replaceNode(node, { type: 'text', value: node.value });
    },
    element: {
        filter: ['a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        visit(node, context) {
            if (node.properties.id) context.setProperty(node, 'id', null);
            if (node.tagName === 'img') {
                context.replaceNode(node, { type: 'text', value: String(node.properties.alt ?? '') });
            }
            if (node.tagName === 'a') {
                const href = String(node.properties.href ?? '');
                if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) context.setProperty(node, 'href', null);
            }
        },
    },
} satisfies HastPluginDefinition;

/** @description 여러 줄의 목록·표를 한 블록으로 렌더링하고 원문의 행 범위를 보존한다. */
function markdownBlocks(body: string): MarkdownBlock[] {
    const source = body.replace(/\r\n/g, '\n');
    const tree = markdownToMdast(source);
    if (tree.type !== 'root') return [];
    const slice = (node: typeof tree.children[number]) => source.slice(node.position?.start.offset, node.position?.end.offset);
    const definitions = tree.children.filter((node) => node.type === 'definition' || node.type === 'footnoteDefinition').map(slice).join('\n\n');
    return tree.children.filter((node) => node.type !== 'definition' && node.type !== 'footnoteDefinition').map((node) => {
        const text = slice(node);
        const first = node.position!.start.line;
        const last = node.position!.end.line;
        return {
            source: text,
            range: first === last ? String(first) : `${first}–${last}`,
            html: markdownToHtml(`${text}\n\n${definitions}`, { hastPlugins: [comparisonMarkup] }).html,
        };
    });
}

/** @description 서식이 유지되는 문단 단위 비교를 만들고 이전·이후 원문 위치를 연결한다. */
export function diffPolicyMarkdown(before: string, after: string): MarkdownDiffBlock[] {
    const oldBlocks = markdownBlocks(before);
    const newBlocks = markdownBlocks(after);
    const keys = (blocks: MarkdownBlock[]) => blocks.map((block) => JSON.stringify([block.source, block.html])).join('\n');
    return diffPolicyLines(keys(oldBlocks), keys(newBlocks)).map((line) => {
        const oldBlock = line.before === null ? undefined : oldBlocks[line.before - 1];
        const newBlock = line.after === null ? undefined : newBlocks[line.after - 1];
        return {
            kind: line.kind,
            before: oldBlock?.range ?? null,
            after: newBlock?.range ?? null,
            html: (newBlock ?? oldBlock)!.html,
        };
    });
}
