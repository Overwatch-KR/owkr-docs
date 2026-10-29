import { motionOptions, prefersReducedMotion } from '../lib/motion';
const runningAnimations = new WeakMap<HTMLDetailsElement, Animation>();

const finishAnimation = (details: HTMLDetailsElement, isOpen: boolean) => {
    details.open = isOpen;
    delete details.dataset.motionState;
    details.style.height = '';
    details.style.overflow = '';
    runningAnimations.delete(details);
};

const toggleDetails = (
    details: HTMLDetailsElement,
    summary: HTMLElement,
) => {
    if (runningAnimations.has(details)) {
        return;
    }

    const isOpening = !details.open;

    if (prefersReducedMotion()) {
        details.open = isOpening;
        return;
    }

    const startHeight = details.offsetHeight;

    if (isOpening) {
        details.open = true;
    }

    details.dataset.motionState = isOpening ? 'opening' : 'closing';
    const styles = getComputedStyle(details);
    const borders = Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);
    const endHeight = isOpening ? details.offsetHeight : summary.offsetHeight + borders;

    details.style.height = `${startHeight}px`;
    details.style.overflow = 'clip';

    const animation = details.animate(
        {
            height: [`${startHeight}px`, `${endHeight}px`],
        },
        motionOptions(),
    );

    runningAnimations.set(details, animation);
    animation.onfinish = () => finishAnimation(details, isOpening);
    animation.oncancel = () => finishAnimation(details, details.open);
};

const openHashTarget = () => {
    if (!window.location.hash) {
        return;
    }

    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));

    if (target instanceof HTMLDetailsElement) {
        target.open = true;
    }
};

document.querySelectorAll<HTMLDetailsElement>('[data-accordion]').forEach((details) => {
    const summary = details.querySelector<HTMLElement>('summary');
    const content = details.querySelector<HTMLElement>('[data-accordion-content]');

    if (!summary || !content) {
        return;
    }

    summary.addEventListener('click', (event) => {
        event.preventDefault();
        toggleDetails(details, summary);
    });
});

openHashTarget();
window.addEventListener('hashchange', openHashTarget);
