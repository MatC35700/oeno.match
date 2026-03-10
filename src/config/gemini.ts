/**
 * Client API Gemini — configuration et helpers
 * Les appels réels sont dans src/lib/gemini/
 */
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
