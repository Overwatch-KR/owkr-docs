export {};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const ANIMATION_DURATION = 240;
const ANIMATION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
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
    content: HTMLElement,
) => {
    if (runningAnimations.has(details)) {
        return;
    }

    const isOpening = !details.open;

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
        details.open = isOpening;
        return;
    }

    const startHeight = details.offsetHeight;

    if (isOpening) {
        details.open = true;
    }

    details.dataset.motionState = isOpening ? 'opening' : 'closing';
    const endHeight = summary.offsetHeight + (isOpening ? content.offsetHeight : 0);

    details.style.height = `${startHeight}px`;
    details.style.overflow = 'clip';

    const animation = details.animate(
        {
            height: [`${startHeight}px`, `${endHeight}px`],
        },
        {
            duration: ANIMATION_DURATION,
            easing: ANIMATION_EASING,
        },
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

document.querySelectorAll<HTMLDetailsElement>('.faq-item').forEach((details) => {
    const summary = details.querySelector<HTMLElement>('summary');
    const content = details.querySelector<HTMLElement>('.faq-item__answer');

    if (!summary || !content) {
        return;
    }

    summary.addEventListener('click', (event) => {
        event.preventDefault();
        toggleDetails(details, summary, content);
    });
});

openHashTarget();
window.addEventListener('hashchange', openHashTarget);
