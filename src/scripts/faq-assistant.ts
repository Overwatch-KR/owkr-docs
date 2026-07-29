export {};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const RESPONSE_DELAY_MS = 420;
const TYPEWRITER_DELAY_MS = 18;
const PANEL_EXIT_DURATION_MS = 220;

const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const animateEntrance = (element: HTMLElement, distance = 8) => {
    if (prefersReducedMotion()) {
        return;
    }

    element.animate(
        [
            { opacity: 0, transform: `translateY(${distance}px)` },
            { opacity: 1, transform: 'translateY(0)' },
        ],
        {
            duration: 240,
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

const cloneTemplateRoot = (template: HTMLTemplateElement) =>
    template.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;

const setupFaqAssistant = (root: HTMLElement) => {
    const trigger = root.querySelector<HTMLButtonElement>('[data-assistant-trigger]');
    const panel = root.querySelector<HTMLElement>('[data-assistant-panel]');
    const scrollArea = root.querySelector<HTMLElement>('[data-assistant-scroll]');
    const conversation = root.querySelector<HTMLElement>('[data-assistant-conversation]');
    const initialMessage = root.querySelector<HTMLElement>('[data-assistant-initial-message]');
    const categoryOptions = root.querySelector<HTMLElement>('[data-assistant-category-options]');
    const questions = root.querySelector<HTMLElement>('[data-assistant-questions]');
    const questionOptions = root.querySelector<HTMLElement>('[data-assistant-question-options]');
    const followUps = root.querySelector<HTMLElement>('[data-assistant-follow-ups]');
    const spacer = root.querySelector<HTMLElement>('[data-assistant-spacer]');
    const backButton = root.querySelector<HTMLButtonElement>('[data-assistant-back]');
    const restartButton = root.querySelector<HTMLButtonElement>('[data-assistant-restart]');
    const userTemplate = root.querySelector<HTMLTemplateElement>('[data-assistant-user-template]');
    const responseTemplate = root.querySelector<HTMLTemplateElement>(
        '[data-assistant-response-template]',
    );
    const closeButtons = root.querySelectorAll<HTMLButtonElement>('[data-assistant-close]');
    const categoryButtons = root.querySelectorAll<HTMLButtonElement>(
        '[data-assistant-category]',
    );
    const questionButtons = root.querySelectorAll<HTMLButtonElement>(
        '[data-assistant-question]',
    );
    const answerTemplates = new Map(
        Array.from(
            root.querySelectorAll<HTMLTemplateElement>('[data-assistant-answer-template]'),
        ).map((template) => [template.dataset.assistantAnswerTemplate, template]),
    );

    if (
        !trigger ||
        !panel ||
        !scrollArea ||
        !conversation ||
        !initialMessage ||
        !categoryOptions ||
        !questions ||
        !questionOptions ||
        !followUps ||
        !spacer ||
        !backButton ||
        !restartButton ||
        !userTemplate ||
        !responseTemplate
    ) {
        return;
    }

    let lastFocusedElement: HTMLElement | null = null;
    let selectedCategoryButton: HTMLButtonElement | null = null;
    let selectedQuestionButton: HTMLButtonElement | null = null;
    let responseTimer: number | null = null;
    let typewriterTimer: number | null = null;
    let resetTimer: number | null = null;
    let isResponding = false;

    const scrollToElement = (element: HTMLElement, block: ScrollLogicalPosition = 'nearest') => {
        window.requestAnimationFrame(() => {
            element.scrollIntoView({
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                block,
            });
        });
    };

    const alignQuestionAtTop = (questionMessage: HTMLElement, responseMessage: HTMLElement) => {
        window.requestAnimationFrame(() => {
            const scrollRect = scrollArea.getBoundingClientRect();
            const questionRect = questionMessage.getBoundingClientRect();
            const viewportHeight = scrollArea.clientHeight;
            const responseHeight = responseMessage.offsetHeight;
            const questionHeight = questionMessage.offsetHeight;
            const targetTop = scrollArea.scrollTop + questionRect.top - scrollRect.top - 12;
            const spacerHeight = Math.max(
                24,
                viewportHeight - questionHeight - responseHeight - 48,
            );

            spacer.style.height = `${spacerHeight}px`;

            window.requestAnimationFrame(() => {
                scrollArea.scrollTo({
                    top: targetTop,
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                });
            });
        });
    };

    const appendUserMessage = (text: string) => {
        const message = cloneTemplateRoot(userTemplate);
        const messageText = message?.querySelector<HTMLElement>('[data-assistant-user-text]');

        if (!message || !messageText) {
            return;
        }

        messageText.textContent = text;
        conversation.append(message);
        animateEntrance(message);

        return message;
    };

    const appendResponse = (answerTemplate: HTMLTemplateElement) => {
        const message = cloneTemplateRoot(responseTemplate);
        const typing = message?.querySelector<HTMLElement>('[data-assistant-typing]');
        const content = message?.querySelector<HTMLElement>('[data-assistant-response-content]');

        if (!message || !typing || !content) {
            return;
        }

        content.append(answerTemplate.content.cloneNode(true));
        conversation.append(message);
        animateEntrance(message);

        return { content, message, typing };
    };

    const clearResponseTimer = () => {
        if (responseTimer === null) {
            return;
        }

        window.clearTimeout(responseTimer);
        responseTimer = null;
    };

    const clearTypewriterTimer = () => {
        if (typewriterTimer === null) {
            return;
        }

        window.clearTimeout(typewriterTimer);
        typewriterTimer = null;
    };

    const typewriteResponse = (content: HTMLElement, onComplete: () => void) => {
        if (prefersReducedMotion()) {
            onComplete();
            return;
        }

        const textNodes: Array<{ node: Text; characters: string[] }> = [];
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
        let textNode = walker.nextNode();

        while (textNode) {
            const node = textNode as Text;
            const value = node.nodeValue ?? '';

            if (value.trim()) {
                textNodes.push({ node, characters: Array.from(value) });
                node.nodeValue = '';
            }

            textNode = walker.nextNode();
        }

        if (textNodes.length === 0) {
            onComplete();
            return;
        }

        content.setAttribute('aria-hidden', 'true');
        let nodeIndex = 0;
        let characterIndex = 0;

        const writeNextCharacter = () => {
            const currentNode = textNodes[nodeIndex];

            if (!currentNode) {
                typewriterTimer = null;
                content.removeAttribute('aria-hidden');
                onComplete();
                return;
            }

            const character = currentNode.characters[characterIndex];

            if (character) {
                currentNode.node.nodeValue = `${currentNode.node.nodeValue ?? ''}${character}`;
                characterIndex += 1;
            }

            if (characterIndex >= currentNode.characters.length) {
                nodeIndex += 1;
                characterIndex = 0;
            }

            typewriterTimer = window.setTimeout(writeNextCharacter, TYPEWRITER_DELAY_MS);
        };

        writeNextCharacter();
    };

    const resetConversation = () => {
        clearResponseTimer();
        clearTypewriterTimer();
        resetTimer = null;
        isResponding = false;
        selectedCategoryButton = null;
        selectedQuestionButton = null;
        categoryButtons.forEach((button) => {
            button.setAttribute('aria-pressed', 'false');
        });
        questionButtons.forEach((button) => {
            button.hidden = true;
        });
        categoryOptions.hidden = false;
        questions.hidden = true;
        questionOptions.hidden = false;
        followUps.hidden = true;
        conversation.ariaBusy = 'false';
        conversation.replaceChildren(initialMessage, categoryOptions, questions, followUps);
        spacer.style.height = '0px';
        scrollArea.scrollTo({ top: 0, behavior: 'auto' });
    };

    const openAssistant = () => {
        if (resetTimer !== null) {
            window.clearTimeout(resetTimer);
            resetConversation();
        }

        lastFocusedElement =
            document.activeElement instanceof HTMLElement &&
            document.activeElement !== document.body
                ? document.activeElement
                : trigger;
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
        clearResponseTimer();
        clearTypewriterTimer();
        isResponding = false;
        conversation.ariaBusy = 'false';

        if (prefersReducedMotion()) {
            resetConversation();
        } else {
            resetTimer = window.setTimeout(resetConversation, PANEL_EXIT_DURATION_MS);
        }

        (lastFocusedElement ?? trigger).focus();
    };

    const showCategory = (categoryButton: HTMLButtonElement) => {
        const category = categoryButton.dataset.assistantCategory;

        if (!category || isResponding) {
            return;
        }

        selectedCategoryButton = categoryButton;
        selectedQuestionButton = null;
        categoryButtons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button === categoryButton));
        });
        questionButtons.forEach((button) => {
            button.hidden = button.dataset.category !== category;
        });
        categoryOptions.hidden = true;
        followUps.hidden = true;
        questionOptions.hidden = false;
        questions.hidden = false;
        spacer.style.height = '0px';
        conversation.append(questions);
        animateEntrance(questions);
        scrollToElement(questions);

        window.requestAnimationFrame(() => {
            Array.from(questionButtons)
                .find((button) => !button.hidden)
                ?.focus({ preventScroll: true });
        });
    };

    const showAnswer = (questionButton: HTMLButtonElement) => {
        const questionId = questionButton.dataset.assistantQuestion;
        const questionText = questionButton.querySelector('span')?.textContent?.trim();
        const answerTemplate = questionId ? answerTemplates.get(questionId) : undefined;

        if (!questionId || !questionText || !answerTemplate || isResponding) {
            return;
        }

        selectedQuestionButton = questionButton;
        isResponding = true;
        questionOptions.hidden = true;
        questions.hidden = true;
        followUps.hidden = true;
        spacer.style.height = '0px';

        const questionMessage = appendUserMessage(questionText);
        const response = appendResponse(answerTemplate);

        if (!questionMessage || !response) {
            isResponding = false;
            return;
        }

        conversation.ariaBusy = 'true';
        questionMessage.focus({ preventScroll: true });
        alignQuestionAtTop(questionMessage, response.message);

        responseTimer = window.setTimeout(
            () => {
                response.typing.hidden = true;
                response.content.hidden = false;
                responseTimer = null;
                typewriteResponse(response.content, () => {
                    followUps.hidden = false;
                    conversation.append(followUps);
                    conversation.ariaBusy = 'false';
                    isResponding = false;
                    animateEntrance(followUps, 6);
                    alignQuestionAtTop(questionMessage, response.message);
                });
            },
            prefersReducedMotion() ? 0 : RESPONSE_DELAY_MS,
        );
    };

    const showQuestions = () => {
        if (!selectedCategoryButton || isResponding) {
            return;
        }

        followUps.hidden = true;
        questionOptions.hidden = false;
        questions.hidden = false;
        spacer.style.height = '0px';
        conversation.append(questions);
        animateEntrance(questions);
        scrollToElement(questions);

        window.requestAnimationFrame(() => {
            (
                selectedQuestionButton ??
                Array.from(questionButtons).find((button) => !button.hidden)
            )?.focus({ preventScroll: true });
        });
    };

    const showCategories = () => {
        if (isResponding) {
            return;
        }

        followUps.hidden = true;
        questions.hidden = true;
        categoryOptions.hidden = false;
        spacer.style.height = '0px';
        conversation.append(categoryOptions);
        animateEntrance(categoryOptions);
        scrollToElement(categoryOptions);

        window.requestAnimationFrame(() => {
            (selectedCategoryButton ?? categoryButtons[0])?.focus({ preventScroll: true });
        });
    };

    trigger.addEventListener('click', openAssistant);
    closeButtons.forEach((button) => button.addEventListener('click', closeAssistant));
    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => showCategory(button));
    });
    questionButtons.forEach((button) => {
        button.addEventListener('click', () => showAnswer(button));
    });
    backButton.addEventListener('click', showQuestions);
    restartButton.addEventListener('click', showCategories);

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
