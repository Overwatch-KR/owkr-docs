export {};

const STORAGE_KEY = 'owkr-theme';
const THEME_COLORS = {
    dark: '#0a0d12',
    light: '#f7f8fa',
} as const;

type Theme = keyof typeof THEME_COLORS;

const getTheme = (): Theme =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

const updateControls = (theme: Theme) => {
    document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';

        button.setAttribute('aria-pressed', String(theme === 'dark'));
        button.setAttribute('aria-label', `${nextTheme === 'light' ? '라이트' : '다크'} 테마로 전환`);
    });
};

const applyTheme = (theme: Theme, persist = false) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
        .querySelector<HTMLMetaElement>('[data-theme-color]')
        ?.setAttribute('content', THEME_COLORS[theme]);
    updateControls(theme);

    if (!persist) {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
};

document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
        applyTheme(getTheme() === 'dark' ? 'light' : 'dark', true);
    });
});

updateControls(getTheme());
