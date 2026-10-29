import GithubSlugger from 'github-slugger';
import type { HastPluginDefinition } from 'satteri';

/** @description 현행 정책 제목에 목차와 같은 번호를 붙이고 기존 앵커는 보존한다. */
export function policyHeadingNumbers(): HastPluginDefinition {
    return {
        name: 'owkr-policy-heading-numbers',
        element: {
            filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            visit(node, context) {
                if (!/\/src\/content\/docs\/gather-bot\/(terms|privacy|support)\.md$/.test(context.fileURL?.pathname ?? '')) return;
                const state = (context.data.owkrPolicyHeadings ??= { slugger: new GithubSlugger(), count: 0 }) as { slugger: GithubSlugger; count: number };
                if (typeof node.properties.id !== 'string') {
                    context.setProperty(node, 'id', state.slugger.slug(context.textContent(node)));
                }
                if (node.tagName !== 'h2') return;
                const number = String(++state.count).padStart(2, '0');
                const first = node.children[0];
                if (first?.type === 'text') {
                    context.replaceNode(first, { type: 'text', value: first.value.replace(/^\d+\.\s*/, '') });
                }
                context.prependChild(node, {
                    type: 'element', tagName: 'span', properties: { className: ['policy-heading-number'] },
                    children: [{ type: 'text', value: `${number}. ` }],
                });
            },
        },
    };
}
