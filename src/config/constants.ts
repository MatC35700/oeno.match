export const APP_NAME = 'Oeno.match';

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'it', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE = 'fr';

export const RATING_MAX = 10;
export const RATING_MIN = 0;
