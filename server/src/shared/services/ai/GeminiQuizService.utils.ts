import {
  STEM_ONLY_PATTERNS,
  MIN_QUESTION_TEXT_LENGTH,
  MIN_EXPLANATION_LENGTH,
} from '../../constants/QuizConstants';

/** Removes characters and patterns that could be used to hijack the AI prompt. */
export function sanitizeForPrompt(value: string, maxLength = 100): string {
  return value
    .replace(/[\n\r`<>]/g, ' ')
    .replace(
      /\b(ignore|forget|disregard|override|bypass|system|prompt|instruction|jailbreak|act as|pretend|roleplay)\b/gi,
      '[REDACTED]',
    )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeTopics(topics: string[]): string[] {
  return topics
    .filter((t) => typeof t === 'string' && t.trim().length > 0)
    .map((t) => sanitizeForPrompt(t, 50));
}

export function sanitizeCourseTitle(title: string): string {
  return sanitizeForPrompt(title, 80);
}

/** Returns true if the text is a stem-only opener rather than a real question. */
export function isStemOnly(text: string): boolean {
  const trimmed = text.trim();
  return STEM_ONLY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isValidQuestion(q: unknown): boolean {
  const question = q as Record<string, unknown>;
  if (!question || typeof question.questionText !== 'string') return false;

  const text = question.questionText.trim();

  // Must be substantial
  if (text.length < MIN_QUESTION_TEXT_LENGTH) return false;

  // Must end with a question mark
  if (!text.endsWith('?')) return false;

  // Reject stem-only openers
  if (isStemOnly(text)) return false;

  // Must have a known type
  if (question.type !== 'mcq' && question.type !== 'true_false') return false;

  // MCQ validation
  if (question.type === 'mcq') {
    if (!Array.isArray(question.options) || question.options.length !== 4)
      return false;
    if (
      question.options.some(
        (o: unknown) => typeof o !== 'string' || o.trim().length === 0,
      )
    )
      return false;
    if (
      typeof question.correctOptionIndex !== 'number' ||
      question.correctOptionIndex < 0 ||
      question.correctOptionIndex > 3
    )
      return false;
  }

  // True/False validation
  if (question.type === 'true_false') {
    if (typeof question.correctAnswer !== 'boolean') return false;
  }

  // Explanation validation
  if (
    typeof question.explanation !== 'string' ||
    question.explanation.trim().length < MIN_EXPLANATION_LENGTH
  )
    return false;

  return true;
}
