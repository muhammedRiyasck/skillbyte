/**
 * AI Model Configuration
 */
export const GEMINI_FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-1.5-flash-latest',
];

export const AI_MAX_OUTPUT_TOKENS = 8192;

/**
 * Quiz Generation Constraints
 */
export const MAX_QUESTIONS_PER_QUIZ = 40;
export const MIN_QUESTIONS_PER_QUIZ = 1;
export const QUIZ_GENERATION_PADDING_PERCENT = 0.2;
export const QUIZ_GENERATION_MIN_PADDING = 2;

/**
 * Validation Constraints
 */
export const MIN_QUESTION_TEXT_LENGTH = 15;
export const MIN_EXPLANATION_LENGTH = 15;

/**
 * Patterns that indicate the model generated a "stem" or setup sentence instead
 * of a real, self-contained question.
 */
export const STEM_ONLY_PATTERNS = [
  /^consider\b/i,
  /^look at\b/i,
  /^refer to\b/i,
  /^examine\b/i,
  /^study the\b/i,
  /^given the (following|code|example|snippet)/i,
  /^based on the (following|code|example|above)/i,
  /^in the (following|code|example|snippet)/i,
  /^observe the\b/i,
  /^read the (following|code|passage)/i,
  /:\s*$/,
];
