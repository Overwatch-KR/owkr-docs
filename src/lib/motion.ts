export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** @description CSS 공통 규격을 읽어 스크립트 애니메이션에도 같은 속도를 적용한다. */
export function motionOptions(): KeyframeAnimationOptions {
    const tokens = getComputedStyle(document.documentElement);
    return {
        duration: prefersReducedMotion() ? 0 : Number.parseFloat(tokens.getPropertyValue('--motion-duration')) || 240,
        easing: tokens.getPropertyValue('--motion-easing').trim() || 'ease',
    };
}
