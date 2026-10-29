import { motionOptions, prefersReducedMotion } from '../lib/motion';
import { createAnswerWriter } from '../lib/answer-writer';

const animateEntrance = (element: HTMLElement) => {
    if (!prefersReducedMotion()) {
        element.animate(
            [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
            motionOptions(),
        );
    }
};

const getFocusableElements = (panel: HTMLElement) =>
    Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => !element.hidden && element.offsetParent !== null);

const cloneTemplateRoot = (template: HTMLTemplateElement) =>
    template.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;

/** @description FAQ 선택을 대화로 쌓고 닫기·초기화 시 지연 응답과 포커스를 관리한다. */
const setupFaqAssistant = (root: HTMLElement) => {
    const trigger = root.querySelector<HTMLButtonElement>('[data-assistant-trigger]');
    const panel = root.querySelector<HTMLElement>('[data-assistant-panel]');
    const scrollArea = root.querySelector<HTMLElement>('[data-assistant-scroll]');
    const conversation = root.querySelector<HTMLElement>('[data-assistant-conversation]');
    const initialMessage = root.querySelector<HTMLElement>('[data-assistant-initial-message]');
    const categoryOptions = root.querySelector<HTMLElement>('[data-assistant-category-options]');
    const questions = root.querySelector<HTMLElement>('[data-assistant-questions]');
    const questionPrompt = root.querySelector<HTMLElement>('[data-assistant-question-prompt]');
    const followUps = root.querySelector<HTMLElement>('[data-assistant-follow-ups]');
    const backButton = root.querySelector<HTMLButtonElement>('[data-assistant-back]');
    const resetButton = root.querySelector<HTMLButtonElement>('[data-assistant-reset]');
    const topicsButton = root.querySelector<HTMLButtonElement>('[data-assistant-topics]');
    const userTemplate = root.querySelector<HTMLTemplateElement>('[data-assistant-user-template]');
    const responseTemplate = root.querySelector<HTMLTemplateElement>('[data-assistant-response-template]');
    const categoryButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-assistant-category]'));
    const questionButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-assistant-question]'));
    const answerTemplates = new Map(Array.from(
        root.querySelectorAll<HTMLTemplateElement>('[data-assistant-answer-template]'),
    ).map((template) => [template.dataset.assistantAnswerTemplate, template]));

    if (!trigger || !panel || !scrollArea || !conversation || !initialMessage || !categoryOptions ||
        !questions || !questionPrompt || !followUps || !backButton || !resetButton || !topicsButton ||
        !userTemplate || !responseTemplate) {
        return;
    }

    const background = Array.from(document.querySelectorAll<HTMLElement>(
        '.site-shell > :not(.faq-assistant), body > .skip-link',
    ));
    const previousInert = new Map<HTMLElement, boolean>();
    let lastFocusedElement: HTMLElement | null = null;
    let selectedCategoryButton: HTMLButtonElement | null = null;
    let selectedQuestionButton: HTMLButtonElement | null = null;
    let responseTimer: number | null = null;
    let isResponding = false;
    let answerWriter: ReturnType<typeof createAnswerWriter> | null = null;

    const scrollConversation = (anchor?: HTMLElement) => {
        window.requestAnimationFrame(() => {
            if (root.dataset.state !== 'open') return;
            const top = anchor
                ? scrollArea.scrollTop + anchor.getBoundingClientRect().top - scrollArea.getBoundingClientRect().top - 16
                : scrollArea.scrollHeight;
            scrollArea.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        });
    };

    const appendUserMessage = (text: string) => {
        const message = cloneTemplateRoot(userTemplate);
        const content = message?.querySelector<HTMLElement>('[data-assistant-user-text]');
        if (!message || !content) return;
        content.textContent = text;
        conversation.append(message);
        resetButton.disabled = false;
        animateEntrance(message);
        return message;
    };

    const resetConversation = () => {
        if (responseTimer !== null) window.clearTimeout(responseTimer);
        responseTimer = null;
        answerWriter?.cancel();
        answerWriter = null;
        isResponding = false;
        selectedCategoryButton = null;
        selectedQuestionButton = null;
        categoryButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
        questionButtons.forEach((button) => { button.hidden = true; });
        categoryOptions.hidden = false;
        questions.hidden = true;
        followUps.hidden = true;
        conversation.ariaBusy = 'false';
        conversation.replaceChildren(initialMessage, categoryOptions, questions, followUps);
        resetButton.disabled = true;
        topicsButton.disabled = false;
        scrollArea.scrollTo({ top: 0, behavior: 'auto' });
        categoryButtons[0]?.focus({ preventScroll: true });
    };

    const openAssistant = () => {
        if (root.dataset.state === 'open') return;
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
        root.dataset.state = 'open';
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.inert = false;
        document.body.classList.add('faq-assistant-open');
        background.forEach((element) => {
            previousInert.set(element, element.inert);
            element.inert = true;
        });
        panel.querySelector<HTMLButtonElement>('[data-assistant-close]')?.focus({ preventScroll: true });
    };

    const closeAssistant = () => {
        root.dataset.state = 'closed';
        answerWriter?.complete();
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        panel.inert = true;
        document.body.classList.remove('faq-assistant-open');
        background.forEach((element) => { element.inert = previousInert.get(element) ?? false; });
        previousInert.clear();
        (lastFocusedElement ?? trigger).focus({ preventScroll: true });
    };

    const showCategories = () => {
        if (isResponding || !categoryOptions.hidden) return;
        questions.hidden = true;
        followUps.hidden = true;
        categoryOptions.hidden = false;
        conversation.append(categoryOptions);
        animateEntrance(categoryOptions);
        scrollConversation();
        (selectedCategoryButton ?? categoryButtons[0])?.focus({ preventScroll: true });
    };

    const showQuestions = () => {
        if (isResponding || !selectedCategoryButton) return;
        categoryOptions.hidden = true;
        followUps.hidden = true;
        questions.hidden = false;
        conversation.append(questions);
        animateEntrance(questions);
        scrollConversation();
        (selectedQuestionButton ?? questionButtons.find((button) => !button.hidden))?.focus({ preventScroll: true });
    };

    const showCategory = (button: HTMLButtonElement) => {
        const category = button.dataset.assistantCategory;
        if (!category || isResponding) return;
        selectedCategoryButton = button;
        selectedQuestionButton = null;
        categoryButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        questionButtons.forEach((item) => { item.hidden = item.dataset.category !== category; });
        appendUserMessage(category);
        questionPrompt.textContent = `${category}에 대해 어떤 내용이 궁금하신가요?`;
        showQuestions();
    };

    const showAnswer = (button: HTMLButtonElement) => {
        const questionId = button.dataset.assistantQuestion;
        const questionText = button.querySelector('span')?.textContent?.trim();
        const answerTemplate = questionId ? answerTemplates.get(questionId) : undefined;
        if (!questionText || !answerTemplate || isResponding) return;
        const response = cloneTemplateRoot(responseTemplate);
        const content = response?.querySelector<HTMLElement>('[data-assistant-response-content]');
        const typing = response?.querySelector<HTMLElement>('[data-assistant-typing]');
        const skip = response?.querySelector<HTMLButtonElement>('[data-assistant-skip]');
        if (!response || !content || !typing || !skip) return;
        selectedQuestionButton = button;
        const userMessage = appendUserMessage(questionText);
        if (!userMessage) return;
        questions.hidden = true;
        followUps.hidden = true;
        isResponding = true;
        topicsButton.disabled = true;
        conversation.ariaBusy = 'true';
        conversation.append(response);
        animateEntrance(response);
        userMessage.focus({ preventScroll: true });
        scrollConversation();

        const finishResponse = () => {
            responseTimer = null;
            content.append(answerTemplate.content.cloneNode(true));
            typing.hidden = true;
            content.hidden = false;
            const finish = () => {
                content.removeAttribute('aria-hidden');
                content.inert = false;
                const skippedWithFocus = document.activeElement === skip;
                skip.hidden = true;
                followUps.hidden = false;
                conversation.append(followUps);
                conversation.ariaBusy = 'false';
                isResponding = false;
                topicsButton.disabled = false;
                answerWriter = null;
                if (skippedWithFocus) backButton.focus({ preventScroll: true });
                scrollConversation();
            };
            if (prefersReducedMotion() || root.dataset.state !== 'open') {
                finish();
                return;
            }
            const nodes: Text[] = [];
            const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
            let node = walker.nextNode();
            while (node) {
                if (node.textContent?.trim()) nodes.push(node as Text);
                node = walker.nextNode();
            }
            content.setAttribute('aria-hidden', 'true');
            content.inert = true;
            skip.hidden = false;
            skip.addEventListener('click', () => answerWriter?.complete(), { once: true });
            answerWriter = createAnswerWriter(nodes.map((text) => ({
                text: text.data,
                write: (value) => { text.data = value; },
            })), {
                schedule: (callback, delay) => window.setTimeout(callback, delay),
                unschedule: (id) => window.clearTimeout(id),
                onComplete: finish,
                onProgress: () => {
                    if (root.dataset.state === 'open' && scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight < 96) {
                        scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: 'auto' });
                    }
                },
            });
        };
        if (prefersReducedMotion()) finishResponse();
        else responseTimer = window.setTimeout(finishResponse, Number(motionOptions().duration));
    };

    trigger.addEventListener('click', openAssistant);
    root.querySelectorAll<HTMLButtonElement>('[data-assistant-close]').forEach((button) => button.addEventListener('click', closeAssistant));
    categoryButtons.forEach((button) => button.addEventListener('click', () => showCategory(button)));
    questionButtons.forEach((button) => button.addEventListener('click', () => showAnswer(button)));
    root.querySelectorAll<HTMLButtonElement>('[data-assistant-restart], [data-assistant-topics]').forEach((button) => button.addEventListener('click', showCategories));
    backButton.addEventListener('click', showQuestions);
    resetButton.addEventListener('click', resetConversation);

    panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeAssistant();
            return;
        }
        if (event.key !== 'Tab') return;
        const elements = getFocusableElements(panel);
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    });
};

document.querySelectorAll<HTMLElement>('[data-faq-assistant]').forEach(setupFaqAssistant);
