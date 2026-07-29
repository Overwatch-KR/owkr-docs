export {};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const animateEntrance = (element: HTMLElement) => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
        return;
    }

    element.animate(
        [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ],
        {
            duration: 220,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
    );
};

const getFocusableElements = (panel: HTMLElement) =>
    Array.from(
        panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
    ).filter((element) => !element.hidden && element.offsetParent !== null);

const setupFaqAssistant = (root: HTMLElement) => {
    const trigger = root.querySelector<HTMLButtonElement>('[data-assistant-trigger]');
    const panel = root.querySelector<HTMLElement>('[data-assistant-panel]');
    const scrollArea = root.querySelector<HTMLElement>('[data-assistant-scroll]');
    const welcomeView = root.querySelector<HTMLElement>('[data-assistant-welcome]');
    const answerView = root.querySelector<HTMLElement>('[data-assistant-answer-view]');
    const selectedQuestion = root.querySelector<HTMLElement>('[data-assistant-selected-question]');
    const questions = root.querySelector<HTMLElement>('[data-assistant-questions]');
    const backButton = root.querySelector<HTMLButtonElement>('[data-assistant-back]');
    const closeButtons = root.querySelectorAll<HTMLButtonElement>('[data-assistant-close]');
    const categoryButtons = root.querySelectorAll<HTMLButtonElement>('[data-assistant-category]');
    const questionButtons = root.querySelectorAll<HTMLButtonElement>('[data-assistant-question]');
    const answers = root.querySelectorAll<HTMLElement>('[data-assistant-answer]');

    if (
        !trigger ||
        !panel ||
        !scrollArea ||
        !welcomeView ||
        !answerView ||
        !selectedQuestion ||
        !questions ||
        !backButton
    ) {
        return;
    }

    let lastFocusedElement: HTMLElement | null = null;
    let selectedCategoryButton: HTMLButtonElement | null = null;

    const openAssistant = () => {
        lastFocusedElement =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        root.dataset.state = 'open';
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.inert = false;
        document.body.classList.add('faq-assistant-open');

        window.requestAnimationFrame(() => {
            panel.querySelector<HTMLButtonElement>('[data-assistant-close]')?.focus();
        });
    };

    const closeAssistant = () => {
        root.dataset.state = 'closed';
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        panel.inert = true;
        document.body.classList.remove('faq-assistant-open');
        (lastFocusedElement ?? trigger).focus();
    };

    const showCategory = (categoryButton: HTMLButtonElement) => {
        const category = categoryButton.dataset.assistantCategory;

        if (!category) {
            return;
        }

        selectedCategoryButton = categoryButton;
        categoryButtons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button === categoryButton));
        });
        questionButtons.forEach((button) => {
            button.hidden = button.dataset.category !== category;
        });
        questions.hidden = false;
        animateEntrance(questions);
        questions.scrollIntoView({
            behavior: window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'auto' : 'smooth',
            block: 'nearest',
        });
    };

    const showAnswer = (questionButton: HTMLButtonElement) => {
        const questionId = questionButton.dataset.assistantQuestion;
        const questionText = questionButton.querySelector('span')?.textContent?.trim();

        if (!questionId || !questionText) {
            return;
        }

        answers.forEach((answer) => {
            answer.hidden = answer.dataset.assistantAnswer !== questionId;
        });
        selectedQuestion.textContent = questionText;
        welcomeView.hidden = true;
        answerView.hidden = false;
        scrollArea.scrollTop = 0;
        animateEntrance(answerView);
        backButton.focus();
    };

    const showWelcome = () => {
        answerView.hidden = true;
        welcomeView.hidden = false;
        scrollArea.scrollTop = 0;
        animateEntrance(welcomeView);
        selectedCategoryButton?.focus();
    };

    trigger.addEventListener('click', openAssistant);
    closeButtons.forEach((button) => button.addEventListener('click', closeAssistant));
    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => showCategory(button));
    });
    questionButtons.forEach((button) => {
        button.addEventListener('click', () => showAnswer(button));
    });
    backButton.addEventListener('click', showWelcome);

    panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeAssistant();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const focusableElements = getFocusableElements(panel);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) {
            return;
        }

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });
};

document.querySelectorAll<HTMLElement>('[data-faq-assistant]').forEach(setupFaqAssistant);
