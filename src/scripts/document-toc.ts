export {};

const toc = document.querySelector<HTMLElement>('[data-document-toc]');
const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-document-toc-link]'),
);
const sections = links
    .map((link) => {
        const id = link.dataset.documentTocLink;
        const heading = id ? document.getElementById(id) : null;

        return heading ? { heading, link } : null;
    })
    .filter((section): section is { heading: HTMLElement; link: HTMLAnchorElement } =>
        Boolean(section),
    );

if (toc && sections.length > 0) {
    let frameId: number | null = null;
    let activeLink: HTMLAnchorElement | null = null;

    const setActiveLink = (link: HTMLAnchorElement) => {
        if (link === activeLink) {
            return;
        }

        activeLink?.classList.remove('is-active');
        activeLink?.removeAttribute('aria-current');
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'location');
        activeLink = link;
    };

    const updateActiveSection = () => {
        frameId = null;
        const threshold = Math.min(window.innerHeight * 0.28, 220);
        const documentHeight = document.documentElement.scrollHeight;
        const isAtDocumentEnd = window.scrollY + window.innerHeight >= documentHeight - 2;
        let currentSection = isAtDocumentEnd ? sections.at(-1)! : sections[0];

        if (!isAtDocumentEnd) {
            for (const section of sections) {
                if (section.heading.getBoundingClientRect().top <= threshold) {
                    currentSection = section;
                } else {
                    break;
                }
            }
        }

        setActiveLink(currentSection.link);
    };

    const scheduleUpdate = () => {
        if (frameId !== null) {
            return;
        }

        frameId = window.requestAnimationFrame(updateActiveSection);
    };

    links.forEach((link) => {
        link.addEventListener('click', () => setActiveLink(link));
    });
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    updateActiveSection();
}
